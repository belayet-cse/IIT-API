import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const allowedOrigins = [
    process.env.WEB_APP_URL,
    'https://iit.belayetsust.com',
    'http://localhost:3000',
    'http://192.168.0.150:3000',
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: [...new Set(allowedOrigins)],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (!process.env.VERCEL) {
    app.useStaticAssets(
      join(process.cwd(), process.env.UPLOADS_DIR ?? 'uploads'),
      {
        prefix: '/uploads/',
      },
    );
  }

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
