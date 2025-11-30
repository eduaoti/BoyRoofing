// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || '*',
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3200;

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running on port ${port}`);
}

bootstrap();
