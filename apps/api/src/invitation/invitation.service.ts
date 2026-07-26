import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "../database/database.service";
import { hashToken, normalizePhone, VerificationService } from "../verification/verification.service";
import { CreateInvitationRequestDto, VerifyInvitationWhatsappDto } from "./invitation.dto";

@Injectable()
export class InvitationService {
  constructor(
    private readonly db: DatabaseService,
    private readonly verification: VerificationService,
    private readonly jwt: JwtService,
  ) {}

  async createRequest(dto: CreateInvitationRequestDto) {
    const email = dto.email.trim().toLowerCase();
    const phone = normalizePhone(dto.phone);

    const result = await this.db.query(
      `INSERT INTO invitation_requests (
        customer_name, phone, email, survey_date, project_type, estimated_budget,
        project_address, latitude, longitude, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, customer_name, phone, email, survey_date, project_type, estimated_budget,
        project_address, latitude, longitude, notes, status, email_verified_at, whatsapp_verified_at, approved_at, user_id, created_at`,
      [
        dto.customerName.trim(),
        phone,
        email,
        dto.surveyDate,
        dto.projectType,
        dto.estimatedBudget,
        dto.projectAddress,
        dto.latitude,
        dto.longitude,
        dto.notes ?? null,
      ],
    );

    await this.verification.sendEmailVerification(email);
    await this.verification.sendWhatsappOtp(phone);

    return {
      invitationRequest: mapInvitation(result.rows[0]),
      verificationRequired: { email: true, whatsapp: true },
      message: "Request invitation tersimpan. Silakan verifikasi email dan WhatsApp, lalu tunggu approval admin.",
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
    if (!row.email_verified_at || !row.whatsapp_verified_at) {
      throw new BadRequestException("Request wajib verifikasi email dan WhatsApp sebelum approval.");
    }

    const tempHash = await bcrypt.hash(randomUUID(), 12);
    const userResult = await this.db.query<{ id: string }>(
      `INSERT INTO users (name, email, phone, password_hash, role, email_verified_at, whatsapp_verified_at)
       VALUES ($1, $2, $3, $4, 'customer', $5, $6)
       ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        email_verified_at = COALESCE(users.email_verified_at, EXCLUDED.email_verified_at),
        whatsapp_verified_at = COALESCE(users.whatsapp_verified_at, EXCLUDED.whatsapp_verified_at),
        updated_at = now()
       RETURNING id`,
      [row.customer_name, row.email, row.phone, tempHash, row.email_verified_at, row.whatsapp_verified_at],
    );

    const userId = userResult.rows[0].id;
    await this.db.query(
      `UPDATE invitation_requests
       SET status = 'approved', approved_at = now(), approved_by = $2, user_id = $3, updated_at = now()
       WHERE id = $1`,
      [id, admin.sub, userId],
    );

    const token = randomUUID().replace(/-/g, "");
    await this.db.query(
      `INSERT INTO password_setup_tokens (user_id, invitation_request_id, token_hash, expires_at)
       VALUES ($1, $2, $3, now() + interval '24 hours')`,
      [userId, id, hashToken(token)],
    );
    await this.verification.sendPasswordSetupEmail(row.email, token);

    return { approved: true, message: "Request disetujui. Email setup password sudah dikirim ke customer." };
  }

  verifyEmail(email: string, token: string) {
    return this.verification.verifyEmail(email.trim().toLowerCase(), token);
  }

  verifyWhatsapp(dto: VerifyInvitationWhatsappDto) {
    return this.verification.verifyWhatsapp(dto.phone, dto.otp);
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