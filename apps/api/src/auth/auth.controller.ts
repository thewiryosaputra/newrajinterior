import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ClientOtpLoginDto, ClientOtpRequestDto, LoginDto, RegisterDto, ResendVerificationDto, SetupPasswordDto, VerifyWhatsappDto } from "./auth.dto";

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

  @Post("client/request-otp")
  requestClientOtp(@Body() dto: ClientOtpRequestDto) {
    return this.auth.requestClientOtp(dto);
  }

  @Post("client/verify-otp")
  verifyClientOtp(@Body() dto: ClientOtpLoginDto) {
    return this.auth.verifyClientOtp(dto);
  }

  @Post("resend-verification")
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.auth.resendVerification(dto);
  }

  @Post("setup-password")
  setupPassword(@Body() dto: SetupPasswordDto) {
    return this.auth.setupPassword(dto);
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