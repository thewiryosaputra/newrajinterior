import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { VerificationService, normalizePhone } from "../verification/verification.service";
import { CreateInvitationRequestDto, VerifyInvitationWhatsappDto } from "./invitation.dto";

@Injectable()
export class InvitationService {
  constructor(
    private readonly db: DatabaseService,
    private readonly verification: VerificationService,
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
        project_address, latitude, longitude, notes, status, email_verified_at, whatsapp_verified_at, created_at`,
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
      message: "Request invitation tersimpan. Customer wajib verifikasi email dan WhatsApp.",
    };
  }

  async listRequests() {
    const result = await this.db.query(
      `SELECT id, customer_name, phone, email, survey_date, project_type, estimated_budget,
        project_address, latitude, longitude, notes, status, email_verified_at, whatsapp_verified_at, created_at
       FROM invitation_requests
       ORDER BY created_at DESC
       LIMIT 50`,
    );
    return { data: result.rows.map(mapInvitation) };
  }

  async getRequest(id: string) {
    const result = await this.db.query(
      `SELECT id, customer_name, phone, email, survey_date, project_type, estimated_budget,
        project_address, latitude, longitude, notes, status, email_verified_at, whatsapp_verified_at, created_at
       FROM invitation_requests
       WHERE id = $1`,
      [id],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException("Invitation request tidak ditemukan.");
    return mapInvitation(row);
  }

  verifyEmail(email: string, token: string) {
    return this.verification.verifyEmail(email.trim().toLowerCase(), token);
  }

  verifyWhatsapp(dto: VerifyInvitationWhatsappDto) {
    return this.verification.verifyWhatsapp(dto.phone, dto.otp);
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
    createdAt: row.created_at,
  };
}