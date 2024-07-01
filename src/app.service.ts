import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './core/logger/logger.service';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  getPublic(): string {
    const configValue = this.configService.get(`environment`);
    this.logger.log(`Process running in ${configValue} environment`);
    return `This is a public route`;
  }
  getPrivate(): string {
    return 'This is a private route!';
  }
  getProfile(user) {
    return user;
  }

  getAdminOnly() {
    return 'This route is admin only';
  }

  getModRoute() {
    return 'This route is accessible to mods';
  }
}
