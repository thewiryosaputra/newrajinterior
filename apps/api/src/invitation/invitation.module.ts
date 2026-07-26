import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { VerificationModule } from "../verification/verification.module";
import { InvitationController } from "./invitation.controller";
import { InvitationService } from "./invitation.service";

@Module({
  imports: [DatabaseModule, VerificationModule],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}