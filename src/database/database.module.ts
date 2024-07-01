import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'),
        port: configService.getOrThrow('DB_PORT'), // If using POSTGRES, ensure not to use the default port if a local isntance of POSTGRES is installed.
        username: configService.getOrThrow('DB_USER'),
        password: configService.getOrThrow('DB_PASSWORD'),
        database: configService.getOrThrow('DB_NAME'),
        autoLoadEntities: true,
        synchronize:
          configService.getOrThrow('NODE_ENV') === 'development' ||
          configService.getOrThrow('NODE_ENV') === 'test',
        dropSchema: configService.getOrThrow('NODE_ENV') === 'test',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
