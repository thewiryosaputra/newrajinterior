import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { DatabaseService } from "../database/database.service";
import { hashToken, normalizePhone, VerificationService } from "../verification/verification.service";
import { LoginDto, RegisterDto, ResendVerificationDto, SetupPasswordDto, VerifyWhatsappDto } from "./auth.dto";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: string;
  email_verified_at: Date | null;
  whatsapp_verified_at: Date | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly verification: VerificationService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const phone = normalizePhone(dto.phone);
    const passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      const result = await this.db.query<UserRow>(
        `INSERT INTO users (name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, phone, password_hash, role, email_verified_at, whatsapp_verified_at`,
        [dto.name.trim(), email, phone, passwordHash],
      );
      const user = result.rows[0];
      await this.verification.sendEmailVerification(user.email, user.id);
      await this.verification.sendWhatsappOtp(user.phone, user.id);
      return {
        user: sanitizeUser(user),
        verificationRequired: { email: true, whatsapp: true },
        message: "Registrasi berhasil. Silakan verifikasi email dan WhatsApp.",
      };
    } catch (error: unknown) {
      if (isPgUniqueError(error)) throw new ConflictException("Email atau nomor WhatsApp sudah terdaftar.");
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const account = dto.account.trim().toLowerCase();
    const normalizedPhone = normalizePhone(account);
    const result = await this.db.query<UserRow>(
      `SELECT id, name, email, phone, password_hash, role, email_verified_at, whatsapp_verified_at
       FROM users
       WHERE lower(email) = $1 OR phone = $2
       LIMIT 1`,
      [account, normalizedPhone],
    );

    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException("Email/nomor telepon atau password salah.");
    }

    if (!user.email_verified_at || !user.whatsapp_verified_at) {
      return {
        user: sanitizeUser(user),
        accessToken: null,
        verificationRequired: {
          email: !user.email_verified_at,
          whatsapp: !user.whatsapp_verified_at,
        },
        message: "Akun perlu verifikasi email dan WhatsApp sebelum masuk.",
      };
    }

    return {
      user: sanitizeUser(user),
      accessToken: await this.signUser(user),
      verificationRequired: { email: false, whatsapp: false },
    };
  }

  async setupPassword(dto: SetupPasswordDto) {
    const result = await this.db.query<UserRow & { token_id: string }>(
      `SELECT users.id, users.name, users.email, users.phone, users.password_hash, users.role,
        users.email_verified_at, users.whatsapp_verified_at, password_setup_tokens.id AS token_id
       FROM password_setup_tokens
       JOIN users ON users.id = password_setup_tokens.user_id
       WHERE password_setup_tokens.token_hash = $1
        AND password_setup_tokens.consumed_at IS NULL
        AND password_setup_tokens.expires_at > now()
       ORDER BY password_setup_tokens.created_at DESC
       LIMIT 1`,
      [hashToken(dto.token)],
    );
    const user = result.rows[0];
    if (!user) throw new UnauthorizedException("Link setup password tidak valid atau sudah kedaluwarsa.");

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.db.query("UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2", [passwordHash, user.id]);
    await this.db.query("UPDATE password_setup_tokens SET consumed_at = now() WHERE id = $1", [user.token_id]);

    return {
      user: sanitizeUser(user),
      accessToken: await this.signUser(user),
      message: "Password berhasil dibuat. Anda sudah masuk ke dashboard customer.",
    };
  }

  async resendVerification(dto: ResendVerificationDto) {
    if (dto.email) await this.verification.sendEmailVerification(dto.email.trim().toLowerCase());
    if (dto.phone) await this.verification.sendWhatsappOtp(dto.phone);
    return { sent: true };
  }

  verifyEmail(email: string, token: string) {
    return this.verification.verifyEmail(email.trim().toLowerCase(), token);
  }

  verifyWhatsapp(dto: VerifyWhatsappDto) {
    return this.verification.verifyWhatsapp(dto.phone, dto.otp);
  }

  async signUser(user: Pick<UserRow, "id" | "email" | "role">) {
    return this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
  }
}

function sanitizeUser(user: UserRow) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    emailVerified: Boolean(user.email_verified_at),
    whatsappVerified: Boolean(user.whatsapp_verified_at),
  };
}

function isPgUniqueError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}