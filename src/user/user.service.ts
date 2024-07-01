import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon from 'argon2';
import { CreateUserDto } from './dto/CreateUserDto';
import { Repository } from 'typeorm';
import { User } from './entities/User.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/UpdateUserDto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUser(query: Record<string, string>) {
    return await this.userRepository.findOneBy(query);
  }
  async createUser(createUserInput: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: createUserInput.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException(['Email is already taken']);
    }

    const user = this.userRepository.create(createUserInput);

    user.password = await argon.hash(createUserInput.password);

    return await this.userRepository.save(user);
  }

  async updateUser(id: string, updateUserInput: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User Not  Found');

    const updateUser = await this.userRepository.save({
      ...user,
      ...updateUserInput,
    });

    return updateUser;
  }
}
