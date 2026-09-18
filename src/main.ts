import 'dotenv/config';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useStaticAssets(join(process.cwd(), 'public'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Round Scoring API')
    .setDescription(
      [
        'Admin and webhook APIs for timed rounds.',
        '',
        '**Counts:** each job webhook increments that participant `create` or `publish` count. There is no points system.',
        '',
        '**Auth:** Admin routes accept `x-api-key` or `Authorization: Bearer <ADMIN_API_KEY>`. Webhook routes require `Authorization: Bearer <WEBHOOK_SECRET>`.',
        '',
        'Only one round can be `active` at a time. Starting a round closes any other active round.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Admin API key (`ADMIN_API_KEY`)',
      },
      'admin-api-key',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key',
        description: 'Admin API key (`ADMIN_API_KEY`) as a Bearer token',
      },
      'admin-bearer',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Secret',
        description: 'Webhook secret (`WEBHOOK_SECRET`)',
      },
      'webhook-secret',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Round Scoring API',
    jsonDocumentUrl: 'docs-json',
    yamlDocumentUrl: 'docs-yaml',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
