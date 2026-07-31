import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "../database/database.service";
import { hashToken, normalizePhone, VerificationService } from "../verification/verification.service";
import { CreateInvitationLinkDto, CreateInvitationRequestDto, VerifyInvitationWhatsappDto } from "./invitation.dto";

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
      `SELECT id, customer_name, phone, email, survey_date, project_type, estimated_budget,
        project_address, latitude, longitude, notes, status, email_verified_at, whatsapp_verified_at, approved_at, user_id, created_at
       FROM invitation_requests
       ORDER BY created_at DESC
       LIMIT 50`,
    );
    return { data: result.rows.map(mapInvitation) };
  }

  async listMyRequests(authHeader?: string) {
    const user = await this.requireUser(authHeader);
    const result = await this.db.query(
      `SELECT id, customer_name, phone, email, survey_date, project_type, estimated_budget,
        project_address, latitude, longitude, notes, status, email_verified_at, whatsapp_verified_at, approved_at, user_id, created_at
       FROM invitation_requests
       WHERE user_id = $1 OR phone = $2
       ORDER BY created_at DESC
       LIMIT 20`,
      [user.sub, user.phone],
    );
    return { data: result.rows.map(mapInvitation) };
  }

  async getRequest(id: string) {
    const result = await this.db.query(
      `SELECT id, customer_name, phone, email, survey_date, project_type, estimated_budget,
        project_address, latitude, longitude, notes, status, email_verified_at, whatsapp_verified_at, approved_at, user_id, created_at
       FROM invitation_requests
       WHERE id = $1`,
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
    status: row.status,
    emailVerified: Boolean(row.email_verified_at),
    whatsappVerified: Boolean(row.whatsapp_verified_at),
    approvedAt: row.approved_at,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

function internalEmailFromPhone(phone: string) {
  return `${phone.replace(/[^0-9]/g, "")}@wa.newraj.local`;
}