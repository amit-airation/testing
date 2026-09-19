import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { WebhookModule } from './webhook/webhook.module.js';

function redisConnectionFromUrl(url = 'redis://127.0.0.1:6379') {
  const parsed = new URL(url);
  const db =
    parsed.pathname && parsed.pathname !== '/'
      ? Number(parsed.pathname.slice(1))
      : undefined;

  return {
    host: parsed.hostname || '127.0.0.1',
    port: parsed.port ? Number(parsed.port) : 6379,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    ...(Number.isFinite(db) ? { db } : {}),
  };
}

@Module({
  imports: [
    BullModule.forRoot({
      connection: redisConnectionFromUrl(process.env.REDIS_URL),
    }),
    PrismaModule,
    AdminModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
