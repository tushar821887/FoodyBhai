import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  const configService = app.get(ConfigService);

  // Global prefix for all API routes
  app.setGlobalPrefix('api');

  // CORS configuration
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'https://foodybhai.in',
        'https://www.foodybhai.in',
        'https://api.foodybhai.in',
        'https://admin.foodybhai.in',
        'http://localhost',
        'https://localhost',
        'capacitor://localhost',
        'ionic://localhost'
      ];
      
      // Allow any localhost port for development
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const frontendUrls = configService.get<string>('FRONTEND_URL', '').split(',').map(url => url.trim());
        if (frontendUrls.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
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
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Foody Bhai Backend running on http://0.0.0.0:${port}`);
  logger.log(`📡 API available at http://0.0.0.0:${port}/api`);
}

bootstrap();
