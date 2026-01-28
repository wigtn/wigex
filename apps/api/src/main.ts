import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS - Environment-aware configuration
  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim());
  app.enableCors({
    origin: corsOrigins || (process.env.NODE_ENV === 'production' ? false : '*'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Validation pipe
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

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Travel Helper API')
      .setDescription('Travel expense management API with AI features')
      .setVersion('3.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('trips', 'Trip management')
      .addTag('expenses', 'Expense management')
      .addTag('wallets', 'Wallet management')
      .addTag('ai', 'AI features (OCR, Chatbot)')
      .addTag('exchange-rates', 'Exchange rate API')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
