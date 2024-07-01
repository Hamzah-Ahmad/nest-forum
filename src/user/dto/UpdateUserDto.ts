import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './CreateUserDto';
import { IsString } from 'class-validator';

export class RefreshTokenClass {
  @IsString()
  refreshToken: string;
}

export class UpdateUserDto extends IntersectionType(
  PartialType(CreateUserDto),
  RefreshTokenClass,
) {}
{
}
