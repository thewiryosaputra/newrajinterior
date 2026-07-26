import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtSignOptions } from "@nestjs/jwt";
import { DatabaseModule } from "../database/database.module";
import { VerificationModule } from "../verification/verification.module";
import { InvitationController } from "./invitation.controller";
import { InvitationService } from "./invitation.service";

@Module({
  imports: [
    DatabaseModule,
    VerificationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: { expiresIn: config.get<string>("JWT_EXPIRES_IN", "7d") as JwtSignOptions["expiresIn"] },
      }),
    }),
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}