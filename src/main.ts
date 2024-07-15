import { NestFactory, Reflector } from '@nestjs/core';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { LoggerService } from './core/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.use(cookieParser());
  app.useLogger(app.get(LoggerService));
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // app.enableCors({
  //   origin: 'http://localhost:3000',
  //   credentials: true,
  // });
  await app.listen(4010);
}
bootstrap();
