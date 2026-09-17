import { Module } from '@nestjs/common';
import { AdminApiKeyGuard } from './admin-api-key.guard.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminApiKeyGuard],
})
export class AdminModule {}
