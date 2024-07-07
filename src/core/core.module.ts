import {
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from '../config';
import { LoggerService } from './logger/logger.service';
import { LoggerMiddleware } from './logger/logger.middleware';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { QueueModule } from './queue/queue.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    DatabaseModule,
    // JwtModule.registerAsync({
    //   // imports: [ConfigModule],
    //   useFactory: async (config) => ({
    //   secret: config.get(),
    //     signOptions: {
    //       expiresIn: '60m',
    //     },
    //   }),
    //   inject: [ConfigService]
    // }),
    JwtModule.register({
      global: true,
    }),
    QueueModule,
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
