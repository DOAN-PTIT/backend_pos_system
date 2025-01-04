import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';

const app_port = process.env.PORT || 8080;
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookies config
  app.use(cookieParser());
  // Set the body parser limit
  app.use(express.json({ limit: '10mb' })); // Increase this limit as needed
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // CORS config
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3888'],
    credentials: true,
    exposedHeaders: ['set-cookie']
  });

  // Data validations
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(app_port, () => {
    console.log(`App is listening on port ${app_port}!`);
  });
}
bootstrap();
