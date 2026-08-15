import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';
import { getAllowedOrigins } from '../src/common/utils/cors';
import type { Request, Response } from 'express';

const expressServer = express();
let app: NestExpressApplication;
let isReady = false;

async function bootstrap() {
  if (isReady) return;
  app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressServer),
    { logger: ['error', 'warn'] },
  );
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
  app.setGlobalPrefix('api');
  await app.init();
  isReady = true;
}

export default async function handler(req: Request, res: Response) {
  await bootstrap();
  expressServer(req, res);
}
