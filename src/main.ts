import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

const app_port = process.env.PORT || 8080

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookies config
  app.use(cookieParser());

  // CORS config
  app.enableCors({
    origin: 'http://localhost:3000', 
    credentials: true,
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
