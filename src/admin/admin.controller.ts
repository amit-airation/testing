import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminApiKeyGuard } from './admin-api-key.guard.js';
import { AdminService } from './admin.service.js';
import { AddParticipantDto } from './dto/add-participant.dto.js';
import { CreateRoundDto } from './dto/create-round.dto.js';
import { UpdateRoundDto } from './dto/update-round.dto.js';

@Controller('admin')
@UseGuards(AdminApiKeyGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('rounds')
  createRound(@Body() dto: CreateRoundDto) {
    return this.adminService.createRound(dto);
  }

  @Get('rounds')
  listRounds() {
    return this.adminService.listRounds();
  }

  @Get('rounds/active')
  getActiveRound() {
    return this.adminService.getActiveRound();
  }

  @Get('rounds/:roundId')
  getRound(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.getRound(roundId);
  }

  @Get('rounds/:roundId/details')
  getRoundDetails(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.getRoundDetails(roundId);
  }

  @Get('rounds/:roundId/leaderboard')
  getLeaderboard(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.getLeaderboard(roundId);
  }

  @Get('rounds/:roundId/participants/:participantId')
  getParticipantDetails(
    @Param('roundId', ParseIntPipe) roundId: number,
    @Param('participantId', ParseIntPipe) participantId: number,
  ) {
    return this.adminService.getParticipantDetails(roundId, participantId);
  }

  @Patch('rounds/:roundId')
  updateRound(
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() dto: UpdateRoundDto,
  ) {
    return this.adminService.updateRound(roundId, dto);
  }

  @Post('rounds/:roundId/start')
  startRound(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.startRound(roundId);
  }

  @Post('rounds/:roundId/stop')
  stopRound(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.stopRound(roundId);
  }

  @Post('rounds/:roundId/participants')
  addParticipant(
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() dto: AddParticipantDto,
  ) {
    return this.adminService.addParticipant(roundId, dto);
  }

  @Get('rounds/:roundId/participants')
  listParticipants(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.listParticipants(roundId);
  }

  @Get('rounds/:roundId/events')
  listWebhookEvents(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.listWebhookEvents(roundId);
  }
}
