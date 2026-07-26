import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, randomInt, randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { DatabaseService } from "../database/database.service";

type Channel = "email" | "whatsapp";

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly db: DatabaseService,
  ) {}

  async sendEmailVerification(target: string, userId?: string) {
    const token = randomUUID().replace(/-/g, "");
    await this.storeToken({ target, channel: "email", token, userId, minutes: 60 });

    const appUrl = this.config.get<string>("APP_URL", "http://localhost:3000");
    const apiUrl = this.config.get<string>("API_URL", "http://localhost:4000");
    const verifyUrl = `${apiUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(target)}`;

    try {
      await this.sendEmail(
        target,
        "Verifikasi email New Raj Interior",
        `Klik link berikut untuk verifikasi email New Raj Interior: ${verifyUrl}\n\nLink berlaku 60 menit.`,
        `<p>Klik tombol berikut untuk verifikasi email New Raj Interior.</p><p><a href="${verifyUrl}">Verifikasi Email</a></p><p>Link berlaku 60 menit.</p><p>Website: ${appUrl}</p>`,
      );
    } catch (error) {
      this.logger.warn(`Email verifikasi untuk ${target} gagal dikirim: ${getErrorMessage(error)}`);
    }
  }

  async sendWhatsappOtp(target: string, userId?: string) {
    const otp = String(randomInt(100000, 999999));
    await this.storeToken({ target: normalizePhone(target), channel: "whatsapp", token: otp, userId, minutes: 10 });
    try {
      await this.sendWhatsapp(target, `Kode verifikasi New Raj Interior Anda: ${otp}. Kode berlaku 10 menit.`);
    } catch (error) {
      this.logger.warn(`OTP WhatsApp untuk ${target} gagal dikirim: ${getErrorMessage(error)}`);
    }
  }

  async verifyEmail(email: string, token: string) {
    const row = await this.consumeToken(email, "email", token);
    if (row.user_id) {
      await this.db.query("UPDATE users SET email_verified_at = now(), updated_at = now() WHERE id = $1", [row.user_id]);
    }
    await this.db.query("UPDATE invitation_requests SET email_verified_at = now(), updated_at = now() WHERE lower(email) = lower($1) AND email_verified_at IS NULL", [email]);
    return { verified: true };
  }

  async verifyWhatsapp(phone: string, otp: string) {
    const normalized = normalizePhone(phone);
    const row = await this.consumeToken(normalized, "whatsapp", otp);
    if (row.user_id) {
      await this.db.query("UPDATE users SET whatsapp_verified_at = now(), updated_at = now() WHERE id = $1", [row.user_id]);
    }
    await this.db.query("UPDATE invitation_requests SET whatsapp_verified_at = now(), updated_at = now() WHERE phone = $1 AND whatsapp_verified_at IS NULL", [phone]);
    return { verified: true };
  }

  private async storeToken(input: { target: string; channel: Channel; token: string; minutes: number; userId?: string }) {
    await this.db.query(
      `INSERT INTO verification_tokens (user_id, target, channel, token_hash, expires_at)
       VALUES ($1, $2, $3, $4, now() + ($5 || ' minutes')::interval)`,
      [input.userId ?? null, input.target, input.channel, hashToken(input.token), input.minutes],
    );
  }

  private async consumeToken(target: string, channel: Channel, token: string) {
    const result = await this.db.query<{ id: string; user_id: string | null }>(
      `SELECT id, user_id
       FROM verification_tokens
       WHERE target = $1 AND channel = $2 AND token_hash = $3 AND consumed_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC
       LIMIT 1`,
      [target, channel, hashToken(token)],
    );

    const row = result.rows[0];
    if (!row) throw new BadRequestException("Kode atau token verifikasi tidak valid atau sudah kedaluwarsa.");

    await this.db.query("UPDATE verification_tokens SET consumed_at = now() WHERE id = $1", [row.id]);
    return row;
  }

  private async sendEmail(to: string, subject: string, text: string, html: string) {
    const host = this.config.get<string>("SMTP_HOST");
    const port = Number(this.config.get<string>("SMTP_PORT", "587"));
    const user = this.config.get<string>("SMTP_USER");
    const pass = this.config.get<string>("SMTP_PASS");

    if (!host || !user || !pass) {
      this.logger.warn(`SMTP belum dikonfigurasi. Email verifikasi untuk ${to} tidak dikirim.`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      to,
      from: this.config.get<string>("EMAIL_FROM", "New Raj Interior <no-reply@newrajinterior.xyz>"),
      subject,
      text,
      html,
    });
  }

  private async sendWhatsapp(phone: string, text: string) {
    const baseUrl = this.config.get<string>("WAHA_BASE_URL");
    const apiKey = this.config.get<string>("WAHA_API_KEY");
    const session = this.config.get<string>("WAHA_SESSION", "newraj-interior");

    if (!baseUrl || !apiKey) {
      this.logger.warn(`WAHA belum dikonfigurasi. OTP WhatsApp untuk ${phone} tidak dikirim.`);
      return;
    }

    const chatId = `${normalizePhone(phone)}@c.us`;
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({ session, chatId, text }),
    });

    if (!response.ok) {
      this.logger.warn(`WAHA gagal mengirim OTP ke ${phone}: ${response.status}`);
    }
  }
}

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
}
function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
