import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CreateInvitationRequestDto, VerifyInvitationWhatsappDto } from "./invitation.dto";
import { InvitationService } from "./invitation.service";

@Controller("invitation-requests")
export class InvitationController {
  constructor(private readonly invitation: InvitationService) {}

  @Post()
  createRequest(@Body() dto: CreateInvitationRequestDto) {
    return this.invitation.createRequest(dto);
  }

  @Get()
  listRequests() {
    return this.invitation.listRequests();
  }

  @Get("verify-email/callback")
  verifyEmail(@Query("email") email: string, @Query("token") token: string) {
    return this.invitation.verifyEmail(email, token);
  }

  @Post("verify-whatsapp")
  verifyWhatsapp(@Body() dto: VerifyInvitationWhatsappDto) {
    return this.invitation.verifyWhatsapp(dto);
  }

  @Get(":id")
  getRequest(@Param("id") id: string) {
    return this.invitation.getRequest(id);
  }
}