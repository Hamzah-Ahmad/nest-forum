import {
  Controller,
  Post,
  UseGuards,
  Get,
  Req,
  Body,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../user/entities/User.entity';
import { Public } from './decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../user/dto/CreateUserDto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  cookieConfig = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60, // 1 week
  };

  @Public()
  @Post('login')
  // NOTE: LocalStrategy requires there to be a username and password field in request body. So sending an a property with the key 'email' instead of 'username' in the request body will not work.
  //  Reference: https://stackoverflow.com/questions/68171886/nestjs-passport-local-strategy-validate-method-never-called
  @UseGuards(AuthGuard('local'))
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.login(user);
    response.cookie('refreshToken', tokens.refreshToken, this.cookieConfig);
    return {
      accessToken: tokens.accessToken,
    };
  }

  @Public()
  @Post('register')
  async signup(
    @Body() createUserInput: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.signup(createUserInput);
    response.cookie('refreshToken', tokens.refreshToken, this.cookieConfig);
    return {
      accessToken: tokens.accessToken,
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = req.user;
    const refreshToken = req.user['refreshToken'];
    const tokens = await this.authService.refreshTokens(
      user?.userId,
      refreshToken,
    );
    response.cookie('refreshToken', tokens.refreshToken, this.cookieConfig);
    return {
      accessToken: tokens.accessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout(@CurrentUser() user: User) {
    this.authService.logout(user.id);
  }
}
