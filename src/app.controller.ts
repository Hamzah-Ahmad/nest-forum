import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { Role, User } from './user/entities/User.entity';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { Roles } from './auth/decorators/roles.decorator';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getPublic(): string {
    return this.appService.getPublic();
  }
  @Get('/private')
  getPrivate(): string {
    return this.appService.getPrivate();
  }
  @Get('/profile')
  getProfile(@CurrentUser() user: User): User {
    return this.appService.getProfile(user);
  }
  @Get('/adminOnly')
  @Roles(Role.Admin)
  getAdminOnly(@CurrentUser() user: User): string {
    return this.appService.getAdminOnly();
  }
  @Get('/modRoute')
  @Roles(Role.Moderator)
  getModRoute(@CurrentUser() user: User): string {
    return this.appService.getModRoute();
  }
}
