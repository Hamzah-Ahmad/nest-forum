import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    // The option passed in super is to allow authentication when request body has the property "email" instead of "username"
    // Reference: https://stackoverflow.com/questions/68171886/nestjs-passport-local-strategy-validate-method-never-called
    super({ usernameField: 'email' });
  }

  public async validate(email: string, password: string): Promise<any> {
    return await this.authService.validateUser(email, password);
  }
}
