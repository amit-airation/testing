import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { WebhookModule } from './webhook/webhook.module.js';

@Module({
  imports: [PrismaModule, AdminModule, WebhookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
