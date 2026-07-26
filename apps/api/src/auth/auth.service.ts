import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { DatabaseService } from "../database/database.service";
import { VerificationService, normalizePhone } from "../verification/verification.service";
import { LoginDto, RegisterDto, ResendVerificationDto, VerifyWhatsappDto } from "./auth.dto";

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