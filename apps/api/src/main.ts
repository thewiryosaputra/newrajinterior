import "reflect-metadata";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const appUrl = config.get<string>("APP_URL", "http://localhost:3000");
  const port = Number(config.get<string>("PORT", "4000"));

  app.use(helmet());
  app.enableCors({
    origin: [appUrl, "https://crm.newrajinterior.xyz"],
    credentials: true,
  });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(port, "0.0.0.0");
}

void bootstrap();