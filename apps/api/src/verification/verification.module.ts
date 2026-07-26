import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { VerificationService } from "./verification.service";

@Module({
  imports: [DatabaseModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}