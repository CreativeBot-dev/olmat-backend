import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  // UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from 'src/core/cache/cache.service';
import { CACHE_KEY_AUTH } from 'src/shared/constants';
import { formatString } from 'src/shared/utils/string';
import authConfig from 'src/shared/config/auth.config';
import { ConfigType } from '@nestjs/config';
import { Hotp, ValidTotpConfig, generateSecret } from 'time2fa';
import { CustomStatusException } from 'src/shared/exceptions/custom.exception';
import { DataSource } from 'typeorm';
import { UserService } from 'src/app-client/user/user.service';
import { Users } from 'src/entities/users.entity';
import { NullableType } from 'src/shared/types/nullable.type';
import { AuthRegisterLoginDto } from '../dto/auth-register-login.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AUTH_EVENT } from 'src/shared/enums/auth-event.enum';
import { EmailOTPEvent } from '../events/email-otp.event';
import { parseTimeToSeconds } from 'src/shared/utils/date';
import { SchoolService } from 'src/app-client/school/school.service';
import { AuthUserLoginDto } from '../dto/auth-user-login.dto';
import { LoginResponseType } from 'src/shared/types/auth/login-response.type';
import { ErrorException } from 'src/shared/exceptions/error.exception';
import { compare } from 'src/shared/utils/hash';
import { UpdateUserAuthDTO } from './dto/update-user-auth.dto';
import { EmailForgotPasswordEvent } from '../events/email-forgot-password.event';
import {
  generateHash,
  generateRandomString,
} from 'src/shared/utils/random-string';
import { UpdateForgetPassDTO } from './dto/update-forget-password.dto';

@Injectable()
export class AuthUserService {
  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    private jwtService: JwtService,
    private usersService: UserService,
    private cacheService: CacheService,
    private schoolService: SchoolService,
    private eventEmitter: EventEmitter2,
    private datasource: DataSource,
  ) {}

  OTPConfig: ValidTotpConfig = {
    algo: 'sha1',
    digits: 6,
    period: this.config.otpExpires ?? 900,
    secretSize: 10,
  };

  private getOTPCacheKey(hash: string): string {
    return formatString(CACHE_KEY_AUTH.OTP, hash);
  }

  private getUserKey(hash: string): string {
    return formatString(CACHE_KEY_AUTH.USER, hash);
  }

  async register(dto: AuthRegisterLoginDto): Promise<string> {
    const userExistPhone = await this.usersService.findOne({
      phone: dto.phone,
    });
    if (userExistPhone) {
      throw new CustomStatusException(`User with phone already exist`, 409);
    }

    const userExistEmail = await this.usersService.findOne({
      email: dto.email,
    });
    if (userExistEmail) {
      throw new CustomStatusException(`User with email already exist`, 409);
    }

    const school = await this.schoolService.findOne({ id: dto.school_id });
    if (!school) {
      throw new CustomStatusException(`School is not register`, 409);
    }

    const secret = generateSecret();
    const userHash = generateHash();
    const otpCounter = 1;

    const passcode = Hotp.generatePasscode(
      {
        counter: otpCounter,
        secret,
      },
      this.OTPConfig,
    );

    await this.cacheService.set(
      this.getUserKey(userHash),
      {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: dto.password,
        school: school,
        otp_secret: secret,
        otp_counter: 1,
      },
      3600,
    );

    await this.cacheService.set(
      this.getOTPCacheKey(userHash),
      1,
      this.config.otpExpires,
    );

    //Send email otp
    this.eventEmitter.emit(
      AUTH_EVENT.AUTH_OTP,
      new EmailOTPEvent(dto.email, passcode),
    );

    return userHash;
  }

  async confirmation(
    hash: string,
    passcode: string,
  ): Promise<{ token: string }> {
    const isSessionValid = await this.cacheService.get(
      this.getOTPCacheKey(hash),
    );

    if (!isSessionValid) {
      throw new ForbiddenException(
        'The provided OTP has expired. Please resend new OTP and try again.',
      );
    }

    const userCache: Users & { otp_counter: number; otp_secret: string } =
      await this.cacheService.get(this.getUserKey(hash));
    if (!userCache) {
      throw new ForbiddenException('Data is invalid.');
    }

    try {
      const isOTPValid = Hotp.validate(
        {
          counter: Number(userCache.otp_counter),
          secret: String(userCache.otp_secret),
          passcode,
        },
        this.OTPConfig,
      );

      if (!isOTPValid) {
        throw new ForbiddenException('OTP is invalid');
      }
    } catch (error) {
      throw new ForbiddenException('OTP is invalid');
    }

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await queryRunner.manager.save(
        queryRunner.manager.create(Users, {
          name: userCache.name,
          email: userCache.email,
          phone: userCache.phone,
          password: userCache.password,
          school: userCache.school,
          region: userCache.school.city.region,
          type: 'user',
        }),
      );

      const token = this.jwtService.sign({
        id: user.id,
        name: user.name,
        school: user.school,
        access: 'user',
      });

      await this.cacheService.set(
        formatString(CACHE_KEY_AUTH.SESSION, user.id),
        true,
        parseTimeToSeconds(this.config.sessionExpires ?? '1h'),
      );

      await queryRunner.commitTransaction();
      await this.cacheService.remove(this.getOTPCacheKey(hash));
      await this.cacheService.remove(this.getUserKey(hash));
      return {
        token: token,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async resendOTP(hash: string) {
    const isSessionValid = await this.cacheService.get(
      this.getOTPCacheKey(hash),
    );
    if (!isSessionValid) {
      throw new ForbiddenException('The provided token has expired.');
    }
    const userCache: Users & { otp_counter: number; otp_secret: string } =
      await this.cacheService.get(this.getUserKey(hash));
    if (!userCache) {
      throw new ForbiddenException('Data is invalid.');
    }

    const userHash = generateHash();
    userCache.otp_counter = Number(userCache.otp_counter) + 1;

    const passcode = Hotp.generatePasscode(
      {
        counter: userCache.otp_counter,
        secret: String(userCache.otp_secret),
      },
      this.OTPConfig,
    );

    await this.cacheService.remove(this.getOTPCacheKey(hash));
    await this.cacheService.set(
      this.getOTPCacheKey(userHash),
      {
        name: userCache.name,
        email: userCache.email,
        phone: userCache.phone,
        otp_counter: userCache.otp_counter,
      },
      this.config.otpExpires,
    );

    //Send email otp
    this.eventEmitter.emit(
      AUTH_EVENT.AUTH_OTP,
      new EmailOTPEvent(userCache.email, passcode),
    );
    return userHash;
  }

  async me(user: Users): Promise<NullableType<Users>> {
    return this.usersService.findOne({
      id: user.id,
    });
  }

  async validateLogin(
    loginDto: AuthUserLoginDto,
  ): Promise<LoginResponseType<Users>> {
    const user = await this.usersService.findOne({
      email: loginDto.email,
    });

    if (!user) {
      throw new ErrorException(
        {
          email: 'notFound',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isValidPassword = compare(loginDto.password, user.password);

    if (!isValidPassword) {
      throw new ErrorException(
        {
          password: 'incorrectPassword',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const token = this.jwtService.sign({
      id: user.id,
      name: user.name,
      school: user.school,
      access: 'user',
      type: user.type.toLowerCase(),
    });

    await this.cacheService.set(
      formatString(CACHE_KEY_AUTH.SESSION, user.id),
      true,
      parseTimeToSeconds(this.config.sessionExpires ?? '1h'),
    );

    return { token, user };
  }

  async logout(token: string): Promise<void> {
    await this.cacheService.remove(formatString(CACHE_KEY_AUTH.SESSION, token));
  }

  async update(
    user: Users,
    userDto: UpdateUserAuthDTO,
  ): Promise<{ name: string; email: string; phone: string }> {
    const currentUser = await this.usersService.findOne({
      id: user.id,
    });

    if (!currentUser) {
      throw new ErrorException(
        {
          user: 'userNotFound',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (userDto.password) {
      if (userDto.currentPassword) {
        const isValidCurrentPassword = compare(
          userDto.currentPassword,
          currentUser.password,
        );

        if (!isValidCurrentPassword) {
          throw new ErrorException(
            {
              currentPassword: 'incorrectCurrentPassword',
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
        if (userDto.password == userDto.currentPassword) {
          throw new ErrorException(
            {
              password: 'password not changed',
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
    }

    const { name, email, phone } = await this.usersService.update(
      user.id,
      userDto,
    );
    return { name, email, phone };
  }

  async getUserHash(hash: string): Promise<NullableType<Users>> {
    return this.usersService.findOne({
      hash: hash,
    });
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.usersService.findOne({
      email,
    });

    if (!user) {
      throw new ErrorException(
        {
          email: 'emailNotExists',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const userCahce: { otp_counter: number } = await this.cacheService.get(
      'FORGOT:' + user.email,
    );

    const otpCounter = userCahce ? userCahce.otp_counter + 1 : 1;

    if (otpCounter > 7) {
      throw new BadRequestException('to many request');
    }

    await this.cacheService.remove('FORGOT:' + user.email).then(async () => {
      await this.cacheService.set('FORGOT:' + user.email, {
        ootp_counter: otpCounter,
      });
    });

    // Hasilkan hash baru
    const hash = generateRandomString(55);

    // Update hash di database
    await this.usersService.updateHashByEmail(email, hash);

    //Send email otp
    this.eventEmitter.emit(
      AUTH_EVENT.AUTH_RESET_PASSWORD,
      new EmailForgotPasswordEvent(user.email, user.id, hash),
    );
    const token = this.jwtService.sign({ email: user.email });

    return token;

    // return 'ok';
  }

  async updatePassword(dto: UpdateForgetPassDTO): Promise<{ message: string }> {
    const { email, hash, newPassword } = dto;

    const user = await this.usersService.findOne({ hash: hash });

    if (!user) {
      throw new BadRequestException('Invalid email or hash provided');
    }

    // Update password using bcrypt
    user.password = newPassword;

    try {
      await this.usersService.updatePassOnForget({
        email: email,
        hash: hash,
        newPassword: newPassword,
      });
      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to update password');
    }
  }
}
