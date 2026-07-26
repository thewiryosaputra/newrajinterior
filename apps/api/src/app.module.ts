import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { DatabaseModule } from "./database/database.module";
import { InvitationModule } from "./invitation/invitation.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    DatabaseModule,
    AuthModule,
    InvitationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}