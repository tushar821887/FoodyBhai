import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global prefix for all API routes
  app.setGlobalPrefix('api');

  // CORS configuration
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:4200',
  );
  app.enableCors({
    origin: frontendUrl.split(',').map((url) => url.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`🚀 Foody Bhai Backend running on http://localhost:${port}`);
  logger.log(`📡 API available at http://localhost:${port}/api`);
}

bootstrap();
