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
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminApiKeyGuard } from './admin-api-key.guard.js';
import { AdminService } from './admin.service.js';
import { AddParticipantDto } from './dto/add-participant.dto.js';
import { CreateRoundDto } from './dto/create-round.dto.js';
import { UpdateRoundDto } from './dto/update-round.dto.js';
import {
  ApiErrorDto,
  LeaderboardResponseDto,
  ParticipantDetailsDto,
  ParticipantDto,
  RoundDetailsDto,
  RoundListItemDto,
  RoundTimingDto,
  WebhookEventDto,
} from '../docs/response.dto.js';

@ApiTags('Admin')
@ApiSecurity('admin-api-key')
@ApiBearerAuth('admin-bearer')
@ApiUnauthorizedResponse({ type: ApiErrorDto })
@Controller('admin')
@UseGuards(AdminApiKeyGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('rounds')
  @ApiOperation({
    summary: 'Create a round',
    description:
      'Creates a draft round by default. Sending `status: "active"` starts it immediately and closes any other active round.',
  })
  @ApiCreatedResponse({ type: RoundTimingDto })
  createRound(@Body() dto: CreateRoundDto) {
    return this.adminService.createRound(dto);
  }

  @Get('rounds')
  @ApiOperation({ summary: 'List rounds' })
  @ApiOkResponse({ type: [RoundListItemDto] })
  listRounds() {
    return this.adminService.listRounds();
  }

  @Get('rounds/active')
  @ApiOperation({ summary: 'Get the active round with details' })
  @ApiOkResponse({ type: RoundDetailsDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  getActiveRound() {
    return this.adminService.getActiveRound();
  }

  @Get('rounds/:roundId')
  @ApiOperation({
    summary: 'Get a round',
    description: 'Same payload as `/admin/rounds/:roundId/details`.',
  })
  @ApiParam({ name: 'roundId', type: Number, example: 1 })
  @ApiOkResponse({ type: RoundDetailsDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  getRound(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.getRound(roundId);
  }

  @Get('rounds/:roundId/details')
  @ApiOperation({
    summary: 'Get round details',
    description:
      'Round timing, participants with scores, ranked leaderboard, webhook events, and summary counts.',
  })
  @ApiParam({ name: 'roundId', type: Number, example: 1 })
  @ApiOkResponse({ type: RoundDetailsDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  getRoundDetails(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.getRoundDetails(roundId);
  }

  @Get('rounds/:roundId/leaderboard')
  @ApiOperation({
    summary: 'Get round leaderboard',
    description:
      'Ranked by `publishCount` descending, then `createCount` descending, then fastest `lastElapsedMs`.',
  })
  @ApiParam({ name: 'roundId', type: Number, example: 1 })
  @ApiOkResponse({ type: LeaderboardResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  getLeaderboard(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.getLeaderboard(roundId);
  }

  @Get('rounds/:roundId/participants/:participantId')
  @ApiOperation({ summary: 'Get participant details for a round' })
  @ApiParam({ name: 'roundId', type: Number, example: 1 })
  @ApiParam({ name: 'participantId', type: Number, example: 3 })
  @ApiOkResponse({ type: ParticipantDetailsDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  getParticipantDetails(
    @Param('roundId', ParseIntPipe) roundId: number,
    @Param('participantId', ParseIntPipe) participantId: number,
  ) {
    return this.adminService.getParticipantDetails(roundId, participantId);
  }

  @Patch('rounds/:roundId')
  @ApiOperation({
    summary: 'Update a round',
    description:
      'Partial update. `status: "active"` starts the round. `status: "closed"` stops it.',
  })
  @ApiParam({ name: 'roundId', type: Number, example: 1 })
  @ApiOkResponse({ type: RoundTimingDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  @ApiConflictResponse({ type: ApiErrorDto })
  updateRound(
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() dto: UpdateRoundDto,
  ) {
    return this.adminService.updateRound(roundId, dto);
  }

  @Post('rounds/:roundId/start')
  @ApiOperation({
    summary: 'Start a round',
    description: 'Closes any other active round first. Only one round can run at a time.',
  })
  @ApiParam({ name: 'roundId', type: Number, example: 1 })
  @ApiOkResponse({ type: RoundTimingDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  @ApiConflictResponse({ type: ApiErrorDto })
  startRound(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.startRound(roundId);
  }

  @Post('rounds/:roundId/stop')
  @ApiOperation({ summary: 'Stop the active round' })
  @ApiParam({ name: 'roundId', type: Number, example: 1 })
  @ApiOkResponse({ type: RoundTimingDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  @ApiConflictResponse({ type: ApiErrorDto })
  stopRound(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.stopRound(roundId);
  }

  @Post('rounds/:roundId/participants')
  @ApiOperation({
    summary: 'Add a participant',
    description:
      'Rejected if the round is closed, or if `mobileNumber` / `companyId` already exists in the round.',
  })
  @ApiParam({ name: 'roundId', type: Number, example: 1 })
  @ApiCreatedResponse({ type: ParticipantDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  @ApiConflictResponse({ type: ApiErrorDto })
  addParticipant(
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() dto: AddParticipantDto,
  ) {
    return this.adminService.addParticipant(roundId, dto);
  }

  @Get('rounds/:roundId/participants')
  @ApiOperation({ summary: 'List participants in a round' })
  @ApiParam({ name: 'roundId', type: Number, example: 1 })
  @ApiOkResponse({ type: [ParticipantDto] })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  listParticipants(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.listParticipants(roundId);
  }

  @Get('rounds/:roundId/events')
  @ApiOperation({ summary: 'List webhook events for a round' })
  @ApiParam({ name: 'roundId', type: Number, example: 1 })
  @ApiOkResponse({ type: [WebhookEventDto] })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  listWebhookEvents(@Param('roundId', ParseIntPipe) roundId: number) {
    return this.adminService.listWebhookEvents(roundId);
  }
}
