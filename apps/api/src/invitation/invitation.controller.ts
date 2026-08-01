import { Body, Controller, Delete, Get, Headers, Param, Post, Query } from "@nestjs/common";
import { CreateInvitationLinkDto, CreateInvitationRequestDto, RescheduleSurveyDto, SubmitSurveyReportDto, VerifyInvitationWhatsappDto } from "./invitation.dto";
import { InvitationService } from "./invitation.service";

@Controller("invitation-requests")
export class InvitationController {
  constructor(private readonly invitation: InvitationService) {}

  @Get("invite")
  listInvitationLinks(@Headers("authorization") authorization?: string) {
    return this.invitation.listInvitationLinks(authorization);
  }

  @Post("invite")
  createInvitationLink(@Body() dto: CreateInvitationLinkDto, @Headers("authorization") authorization?: string) {
    return this.invitation.createInvitationLink(dto, authorization);
  }

  @Delete("invite/:id")
  revokeInvitationLink(@Param("id") id: string, @Headers("authorization") authorization?: string) {
    return this.invitation.revokeInvitationLink(id, authorization);
  }

  @Post()
  createRequest(@Body() dto: CreateInvitationRequestDto) {
    return this.invitation.createRequest(dto);
  }

  @Get()
  listRequests() {
    return this.invitation.listRequests();
  }

  @Get("my")
  listMyRequests(@Headers("authorization") authorization?: string) {
    return this.invitation.listMyRequests(authorization);
  }

  @Get("verify-email/callback")
  verifyEmail(@Query("email") email: string, @Query("token") token: string) {
    return this.invitation.verifyEmail(email, token);
  }

  @Post("verify-whatsapp")
  verifyWhatsapp(@Body() dto: VerifyInvitationWhatsappDto) {
    return this.invitation.verifyWhatsapp(dto);
  }

  @Post(":id/approve")
  approveRequest(@Param("id") id: string, @Headers("authorization") authorization?: string) {
    return this.invitation.approveRequest(id, authorization);
  }

  @Post(":id/surveyor-approve")
  approveBySurveyor(@Param("id") id: string, @Headers("authorization") authorization?: string) {
    return this.invitation.approveBySurveyor(id, authorization);
  }

  @Post(":id/reschedule-survey")
  rescheduleSurvey(@Param("id") id: string, @Body() dto: RescheduleSurveyDto, @Headers("authorization") authorization?: string) {
    return this.invitation.rescheduleSurvey(id, dto, authorization);
  }

  @Post(":id/survey-report")
  submitSurveyReport(@Param("id") id: string, @Body() dto: SubmitSurveyReportDto, @Headers("authorization") authorization?: string) {
    return this.invitation.submitSurveyReport(id, dto, authorization);
  }

  @Get(":id")
  getRequest(@Param("id") id: string) {
    return this.invitation.getRequest(id);
  }
}