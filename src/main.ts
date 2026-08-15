import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { getAllowedOrigins } from './common/utils/cors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useBodyParser('json', { limit: '10mb' });
  app.useBodyParser('urlencoded', { limit: '10mb', extended: true });

  app.enableCors({
    origin: getAllowedOrigins(),
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
