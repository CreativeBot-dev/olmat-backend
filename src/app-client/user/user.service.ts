import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityCondition } from 'src/shared/types/entity-condition.type';
import { Users } from 'src/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { ErrorException } from 'src/shared/exceptions/error.exception';
import { compare, hash } from 'bcrypt';
import { CacheService } from 'src/core/cache/cache.service';
import { UpdateForgetPassDTO } from 'src/auth/user/dto/update-forget-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users) private userRepository: Repository<Users>,
    private cacheService: CacheService,
  ) {}

  async findOne(condition: EntityCondition<Users>) {
    return await this.userRepository.findOne({
      where: condition,
      relations: { school: { degree: true }, region: true },
    });
  }

  async update(id: string, payload: UpdateUserDto): Promise<Users> {
    const user = await this.findOne({ id });
    if (!user) {
      throw new BadRequestException();
    }

    if (payload.phone) {
      const isUserExist = await this.userRepository.findOne({
        where: { phone: payload.phone },
      });
      if (isUserExist && isUserExist.id !== user.id) {
        throw new BadRequestException('Phone number already exists');
      }
      user.phone = payload.phone;
    }

    if (payload.email) {
      const isUserExist = await this.userRepository.findOne({
        where: { email: payload.email },
      });
      if (isUserExist && isUserExist.id !== user.id) {
        throw new BadRequestException('Email already exists');
      }
      user.email = payload.email;
    }

    if (payload.name) {
      user.name = payload.name;
    }

    if (payload.password) {
      if (payload.currentPassword) {
        const isValidCurrentPassword = await compare(
          payload.currentPassword,
          user.password,
        );

        if (!isValidCurrentPassword) {
          throw new ErrorException(
            {
              currentPassword: 'incorrectCurrentPassword',
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }

        if (payload.password === payload.currentPassword) {
          throw new ErrorException(
            {
              password: 'Password must be different from current password',
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }

        if (payload.password.length < 8) {
          throw new ErrorException(
            {
              password: 'Password must be at least 8 characters',
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      } else {
        throw new ErrorException(
          {
            currentPassword: 'missingCurrentPassword',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      user.password = await hash(payload.password, 10);
    }

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async updateHashByEmail(email: string, hash: string): Promise<void> {
    await this.userRepository.update({ email }, { hash });
  }

  async updatePassOnForget(
    dto: UpdateForgetPassDTO,
  ): Promise<{ message: string }> {
    const { email, hash: userHash, newPassword } = dto;

    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!user || user.hash !== userHash) {
      throw new BadRequestException('Invalid email or hash');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const isSamePassword = await compare(newPassword, user.password);
    if (isSamePassword) {
      await this.cacheService.set('FORGOT:' + user.email, { otp_counter: 0 });
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    // user.password = await hash(newPassword, 10);
    user.password = newPassword;

    try {
      user.hash = null;
      await this.userRepository.save(user);
      await this.cacheService.set('FORGOT:' + user.email, { otp_counter: 0 });
      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to update password');
    }
  }
}
