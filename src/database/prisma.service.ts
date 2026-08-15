import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Cap the pool at a small size per instance: on serverless, many function
    // instances can spin up concurrently, and each opening its own default-sized
    // pg pool (max 10) against a pooled Postgres endpoint (e.g. Neon's PgBouncer)
    // quickly exhausts the upstream connection limit and starves the whole app.
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL as string,
        max: 3,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
