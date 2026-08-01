import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "../database/database.service";
import { hashToken, normalizePhone, VerificationService } from "../verification/verification.service";
import { CreateInvitationLinkDto, CreateInvitationRequestDto, RescheduleSurveyDto, SubmitSurveyReportDto, VerifyInvitationWhatsappDto } from "./invitation.dto";

@Injectable()
export class InvitationService {
  constructor(
    private readonly db: DatabaseService,
    private readonly verification: VerificationService,
    private readonly jwt: JwtService,
  ) {}

  async createInvitationLink(dto: CreateInvitationLinkDto, authHeader?: string) {
    const admin = await this.requireAdmin(authHeader);
    const phone = normalizePhone(dto.phone);
    const email = internalEmailFromPhone(phone);
    const token = randomUUID().replace(/-/g, "");
    const appUrl = process.env.APP_URL ?? "https://crm.newrajinterior.xyz";
    const link = `${appUrl}/invitation/request?token=${token}`;

    const result = await this.db.query(
      `INSERT INTO invitation_links (customer_name, email, phone, token_hash, expires_at, created_by)
       VALUES ($1, $2, $3, $4, now() + interval '7 days', $5)
       RETURNING id, customer_name, email, phone, expires_at, created_at`,
      [dto.customerName.trim(), email, phone, hashToken(token), admin.sub],
    );

    await this.verification.sendInvitationLink({ customerName: dto.customerName.trim(), phone, link });

    return {
      invitation: {
        id: result.rows[0].id,
        customerName: result.rows[0].customer_name,
        email: result.rows[0].email,
        phone: result.rows[0].phone,
        expiresAt: result.rows[0].expires_at,
        createdAt: result.rows[0].created_at,
      },
      link,
      message: "Link request invitation sudah dikirim lewat WhatsApp.",
    };
  }

  async listInvitationLinks(authHeader?: string) {
    await this.requireAdmin(authHeader);
    const result = await this.db.query(
      `SELECT id, customer_name, email, phone, expires_at, used_at, revoked_at, invitation_request_id, created_at
       FROM invitation_links
       ORDER BY created_at DESC
       LIMIT 100`,
    );
    return {
      data: result.rows.map((row) => ({
        id: row.id,
        customerName: row.customer_name,
        email: row.email,
        phone: row.phone,
        expiresAt: row.expires_at,
        usedAt: row.used_at,
        revokedAt: row.revoked_at,
        invitationRequestId: row.invitation_request_id,
        status: row.revoked_at ? "revoked" : row.used_at ? "used" : new Date(row.expires_at) < new Date() ? "expired" : "active",
        createdAt: row.created_at,
      })),
    };
  }

  async revokeInvitationLink(id: string, authHeader?: string) {
    await this.requireAdmin(authHeader);
    const result = await this.db.query(
      `UPDATE invitation_links
       SET revoked_at = now()
       WHERE id = $1 AND used_at IS NULL AND revoked_at IS NULL
       RETURNING id`,
      [id],
    );
    if (!result.rowCount) throw new NotFoundException("Invitation link tidak ditemukan atau sudah tidak aktif.");
    return { deleted: true, message: "Invitation link sudah dihapus dan tidak aktif lagi." };
  }

  async createRequest(dto: CreateInvitationRequestDto) {
    const phone = normalizePhone(dto.phone);
    const invitationLink = await this.consumeInvitationLink(dto.token, phone);
    const email = invitationLink.email || internalEmailFromPhone(phone);

    const result = await this.db.query(
      `INSERT INTO invitation_requests (
        customer_name, phone, email, survey_date, project_type, estimated_budget,
        project_address, latitude, longitude, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending_approval')
      RETURNING id, customer_name, phone, email, survey_date, project_type, estimated_budget,
        project_address, latitude, longitude, notes, status, email_verified_at, whatsapp_verified_at, approved_at, user_id, created_at`,
      [
        invitationLink.customer_name,
        phone,
        email,
        dto.surveyDate,
        dto.projectType,
        dto.estimatedBudget ?? "",
        dto.projectAddress,
        dto.latitude,
        dto.longitude,
        dto.notes ?? null,
      ],
    );

    await this.db.query("UPDATE invitation_links SET used_at = now(), invitation_request_id = $1 WHERE id = $2", [result.rows[0].id, invitationLink.id]);

    return {
      invitationRequest: mapInvitation(result.rows[0]),
      verificationRequired: { email: false, whatsapp: false },
      message: "Request jadwal kunjungan berhasil disimpan. Silakan tunggu approval admin.",
    };
  }

  async listRequests() {
    const result = await this.db.query(
      `SELECT ir.id, ir.customer_name, ir.phone, ir.email, ir.survey_date, ir.project_type, ir.estimated_budget,
        ir.project_address, ir.latitude, ir.longitude, ir.notes, ir.survey_reschedule_note, ir.surveyor_approved_at, ir.status, ir.email_verified_at, ir.whatsapp_verified_at, ir.approved_at, ir.user_id, ir.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', sr.id,
              'photoLink', sr.photo_link,
              'videoLink', sr.video_link,
              'measurementNotes', sr.measurement_notes,
              'createdAt', sr.created_at
            ) ORDER BY sr.created_at DESC
          ) FILTER (WHERE sr.id IS NOT NULL),
          '[]'::json
        ) AS survey_reports
       FROM invitation_requests ir
       LEFT JOIN survey_reports sr ON sr.invitation_request_id = ir.id
       GROUP BY ir.id
       ORDER BY ir.created_at DESC
       LIMIT 50`,
    );
    return { data: result.rows.map(mapInvitation) };
  }

  async listMyRequests(authHeader?: string) {
    const user = await this.requireUser(authHeader);
    const result = await this.db.query(
      `SELECT ir.id, ir.customer_name, ir.phone, ir.email, ir.survey_date, ir.project_type, ir.estimated_budget,
        ir.project_address, ir.latitude, ir.longitude, ir.notes, ir.survey_reschedule_note, ir.surveyor_approved_at, ir.status, ir.email_verified_at, ir.whatsapp_verified_at, ir.approved_at, ir.user_id, ir.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', sr.id,
              'photoLink', sr.photo_link,
              'videoLink', sr.video_link,
              'measurementNotes', sr.measurement_notes,
              'createdAt', sr.created_at
            ) ORDER BY sr.created_at DESC
          ) FILTER (WHERE sr.id IS NOT NULL),
          '[]'::json
        ) AS survey_reports
       FROM invitation_requests ir
       LEFT JOIN survey_reports sr ON sr.invitation_request_id = ir.id
       WHERE ir.user_id = $1 OR ir.phone = $2
       GROUP BY ir.id
       ORDER BY ir.created_at DESC
       LIMIT 20`,
      [user.sub, user.phone],
    );
    return { data: result.rows.map(mapInvitation) };
  }

  async getRequest(id: string) {
    const result = await this.db.query(
      `SELECT ir.id, ir.customer_name, ir.phone, ir.email, ir.survey_date, ir.project_type, ir.estimated_budget,
        ir.project_address, ir.latitude, ir.longitude, ir.notes, ir.survey_reschedule_note, ir.surveyor_approved_at, ir.status, ir.email_verified_at, ir.whatsapp_verified_at, ir.approved_at, ir.user_id, ir.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', sr.id,
              'photoLink', sr.photo_link,
              'videoLink', sr.video_link,
              'measurementNotes', sr.measurement_notes,
              'createdAt', sr.created_at
            ) ORDER BY sr.created_at DESC
          ) FILTER (WHERE sr.id IS NOT NULL),
          '[]'::json
        ) AS survey_reports
       FROM invitation_requests ir
       LEFT JOIN survey_reports sr ON sr.invitation_request_id = ir.id
       WHERE ir.id = $1
       GROUP BY ir.id`,
      [id],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException("Invitation request tidak ditemukan.");
    return mapInvitation(row);
  }

  async approveRequest(id: string, authHeader?: string) {
    const admin = await this.requireAdmin(authHeader);
    const request = await this.db.query<{
      id: string;
      customer_name: string;
      email: string;
      phone: string;
      email_verified_at: Date | null;
      whatsapp_verified_at: Date | null;
      status: string;
    }>(
      `SELECT id, customer_name, email, phone, email_verified_at, whatsapp_verified_at, status
       FROM invitation_requests
       WHERE id = $1`,
      [id],
    );
    const row = request.rows[0];
    if (!row) throw new NotFoundException("Invitation request tidak ditemukan.");
    const tempHash = await bcrypt.hash(randomUUID(), 12);
    const userResult = await this.db.query<{ id: string }>(
      `INSERT INTO users (name, email, phone, password_hash, role, email_verified_at, whatsapp_verified_at)
       VALUES ($1, $2, $3, $4, 'customer', $5, $6)
       ON CONFLICT (phone) DO UPDATE SET
        name = EXCLUDED.name,
        email = COALESCE(users.email, EXCLUDED.email),
        role = 'customer',
        email_verified_at = COALESCE(users.email_verified_at, EXCLUDED.email_verified_at),
        whatsapp_verified_at = COALESCE(users.whatsapp_verified_at, EXCLUDED.whatsapp_verified_at),
        updated_at = now()
       RETURNING id`,
      [row.customer_name, row.email || internalEmailFromPhone(row.phone), row.phone, tempHash, row.email_verified_at ?? new Date(), row.whatsapp_verified_at ?? new Date()],
    );

    const userId = userResult.rows[0].id;
    await this.db.query(
      `UPDATE invitation_requests
       SET status = 'approved', approved_at = now(), approved_by = $2, user_id = $3, updated_at = now()
       WHERE id = $1`,
      [id, admin.sub, userId],
    );

    await this.verification.sendAccountApprovedWhatsapp(row.phone);
    return { approved: true, message: "Request disetujui. Akun client sudah aktif dan pemberitahuan login dikirim lewat WhatsApp." };
  }

  async approveBySurveyor(id: string, authHeader?: string) {
    const surveyor = await this.requireSurveyor(authHeader);
    const result = await this.db.query(
      `UPDATE invitation_requests
       SET status = 'approved', surveyor_approved_at = now(), surveyor_approved_by = $2, updated_at = now()
       WHERE id = $1 AND (status = 'approved' OR approved_at IS NOT NULL)
       RETURNING id, customer_name, phone, email, survey_date, project_type, estimated_budget,
        project_address, latitude, longitude, notes, survey_reschedule_note, surveyor_approved_at, status, email_verified_at, whatsapp_verified_at, approved_at, user_id, created_at`,
      [id, surveyor.sub],
    );

    const row = result.rows[0];
    if (!row) throw new NotFoundException("Jadwal survey tidak ditemukan atau belum approved admin.");
    await this.verification.sendSurveyorApprovedWhatsapp({
      phone: String(row.phone),
      customerName: String(row.customer_name),
      surveyDate: new Date(String(row.survey_date)),
    });

    return { data: mapInvitation(row), message: "Survey approved dan notifikasi WhatsApp dikirim ke client." };
  }

  async submitSurveyReport(id: string, dto: SubmitSurveyReportDto, authHeader?: string) {
    const surveyor = await this.requireSurveyor(authHeader);
    const request = await this.db.query<{ id: string; customer_name: string; phone: string }>(
      `SELECT id, customer_name, phone
       FROM invitation_requests
       WHERE id = $1 AND (status = 'approved' OR approved_at IS NOT NULL)`,
      [id],
    );
    const requestRow = request.rows[0];
    if (!requestRow) throw new NotFoundException("Jadwal survey tidak ditemukan atau belum approved admin.");

    await this.db.query(
      `INSERT INTO survey_reports (invitation_request_id, submitted_by, photo_link, video_link, measurement_notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, surveyor.sub, dto.photoLink?.trim() || null, dto.videoLink?.trim() || null, dto.measurementNotes.trim()],
    );

    const result = await this.db.query(
      `SELECT ir.id, ir.customer_name, ir.phone, ir.email, ir.survey_date, ir.project_type, ir.estimated_budget,
        ir.project_address, ir.latitude, ir.longitude, ir.notes, ir.survey_reschedule_note, ir.surveyor_approved_at, ir.status, ir.email_verified_at, ir.whatsapp_verified_at, ir.approved_at, ir.user_id, ir.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', sr.id,
              'photoLink', sr.photo_link,
              'videoLink', sr.video_link,
              'measurementNotes', sr.measurement_notes,
              'createdAt', sr.created_at
            ) ORDER BY sr.created_at DESC
          ) FILTER (WHERE sr.id IS NOT NULL),
          '[]'::json
        ) AS survey_reports
       FROM invitation_requests ir
       LEFT JOIN survey_reports sr ON sr.invitation_request_id = ir.id
       WHERE ir.id = $1
       GROUP BY ir.id`,
      [id],
    );

    await this.verification.sendSurveyReportSubmittedWhatsapp({
      phone: requestRow.phone,
      customerName: requestRow.customer_name,
    });

    return { data: mapInvitation(result.rows[0]), message: "Report survey berhasil disimpan." };
  }

  async rescheduleSurvey(id: string, dto: RescheduleSurveyDto, authHeader?: string) {
    await this.requireSurveyor(authHeader);
    const result = await this.db.query(
      `UPDATE invitation_requests
       SET survey_date = $2, survey_reschedule_note = $3, updated_at = now()
       WHERE id = $1 AND (status = 'approved' OR approved_at IS NOT NULL)
       RETURNING id, customer_name, phone, email, survey_date, project_type, estimated_budget,
        project_address, latitude, longitude, notes, survey_reschedule_note, surveyor_approved_at, status, email_verified_at, whatsapp_verified_at, approved_at, user_id, created_at`,
      [id, dto.surveyDate, dto.reason.trim()],
    );

    const row = result.rows[0];
    if (!row) throw new NotFoundException("Jadwal survey tidak ditemukan atau belum approved.");
    await this.verification.sendSurveyRescheduledWhatsapp({
      phone: String(row.phone),
      customerName: String(row.customer_name),
      surveyDate: new Date(String(row.survey_date)),
      reason: dto.reason.trim(),
    });

    return { data: mapInvitation(row), message: "Jadwal survey berhasil diubah dan notifikasi WhatsApp dikirim ke client." };
  }
  verifyEmail(email: string, token: string) {
    return this.verification.verifyEmail(email.trim().toLowerCase(), token);
  }

  verifyWhatsapp(dto: VerifyInvitationWhatsappDto) {
    return this.verification.verifyWhatsapp(dto.phone, dto.otp);
  }

  private async consumeInvitationLink(token: string, phone: string) {
    const result = await this.db.query<{ id: string; customer_name: string; email: string; phone: string }>(
      `SELECT id, customer_name, email, phone
       FROM invitation_links
       WHERE token_hash = $1 AND used_at IS NULL AND revoked_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC
       LIMIT 1`,
      [hashToken(token)],
    );
    const row = result.rows[0];
    if (!row) throw new BadRequestException("Link request invitation tidak valid, sudah digunakan, atau sudah kedaluwarsa.");
    if (row.phone !== phone) {
      throw new BadRequestException("Nomor WhatsApp tidak sesuai dengan invitation link.");
    }
    return row;
  }

  private async requireSurveyor(authHeader?: string) {
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) throw new UnauthorizedException("Login surveyor diperlukan.");
    const payload = await this.jwt.verifyAsync<{ sub: string; role: string }>(token).catch(() => null);
    if (!payload) throw new UnauthorizedException("Token login tidak valid.");
    if (payload.role !== "surveyor" && payload.role !== "admin") throw new ForbiddenException("Hanya surveyor yang boleh mengubah jadwal survey.");
    return payload;
  }
  private async requireUser(authHeader?: string) {
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) throw new UnauthorizedException("Login diperlukan.");
    const payload = await this.jwt.verifyAsync<{ sub: string; role: string; email: string }>(token).catch(() => null);
    if (!payload) throw new UnauthorizedException("Token login tidak valid.");
    const result = await this.db.query<{ phone: string }>("SELECT phone FROM users WHERE id = $1 LIMIT 1", [payload.sub]);
    return { ...payload, phone: result.rows[0]?.phone ?? "" };
  }

  private async requireAdmin(authHeader?: string) {
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) throw new UnauthorizedException("Admin login diperlukan.");
    const payload = await this.jwt.verifyAsync<{ sub: string; role: string }>(token).catch(() => null);
    if (!payload) throw new UnauthorizedException("Token admin tidak valid.");
    if (payload.role !== "admin") throw new ForbiddenException("Hanya admin yang boleh approve invitation request.");
    return payload;
  }
}

function mapInvitation(row: Record<string, unknown>) {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    surveyDate: row.survey_date,
    projectType: row.project_type,
    estimatedBudget: row.estimated_budget,
    projectAddress: row.project_address,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    notes: row.notes,
    surveyRescheduleNote: row.survey_reschedule_note,
    surveyorApprovedAt: row.surveyor_approved_at,
    surveyReports: normalizeSurveyReports(row.survey_reports),
    status: row.status,
    emailVerified: Boolean(row.email_verified_at),
    whatsappVerified: Boolean(row.whatsapp_verified_at),
    approvedAt: row.approved_at,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

function normalizeSurveyReports(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function internalEmailFromPhone(phone: string) {
  return `${phone.replace(/[^0-9]/g, "")}@wa.newraj.local`;
}
