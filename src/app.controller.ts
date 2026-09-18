import { Controller, Get, Redirect } from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ type: String, example: 'Hello World!' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('ui')
  @ApiExcludeEndpoint()
  @Redirect('/admin.html', 302)
  adminUi() {
    return;
  }
}
