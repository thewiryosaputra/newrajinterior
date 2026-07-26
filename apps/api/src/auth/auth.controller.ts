import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto, ResendVerificationDto, VerifyWhatsappDto } from "./auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post("resend-verification")
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.auth.resendVerification(dto);
  }

  @Get("verify-email")
  verifyEmail(@Query("email") email: string, @Query("token") token: string) {
    return this.auth.verifyEmail(email, token);
  }

  @Post("verify-whatsapp")
  verifyWhatsapp(@Body() dto: VerifyWhatsappDto) {
    return this.auth.verifyWhatsapp(dto);
  }
}