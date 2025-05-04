import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import databaseConfig from 'src/shared/config/database.config';
import appConfig from 'src/shared/config/app.config';
import { TypeOrmConfigService } from 'src/database/typeorm-config.service';
import { BackofficeModules } from 'src/app-backoffice/module';
import authConfig from 'src/shared/config/auth.config';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/shared/guards/role.guard';
import cacheConfig from 'src/shared/config/cache.config';
import { RedisClientOptions } from 'redis';
import { MailerModule } from '@nestjs-modules/mailer';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserCLientModules } from 'src/app-client/module';
import { AuthModule } from 'src/auth/auth.module';
import { WebhookModule } from 'src/core/webhook/webhook.module';
import { VendorModule } from 'src/vendor/vendor.module';
import { AppCacheModule } from 'src/core/cache/cache.module';
import { SettingModule } from 'src/core/setting/setting.module';
import { AllConfigType } from 'src/shared/types/config.type';
import { MailConfigService } from 'src/core/mail-config.service';
import mailConfig from 'src/shared/config/mail.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, authConfig, cacheConfig, mailConfig],
      envFilePath: ['.env'],
    }),
    EventEmitterModule.forRoot({
      global: true,
      verboseMemoryLeak: true,
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        isGlobal: true,
        store: require('cache-manager-redis-store'),
        host: configService.get('cache.host', { infer: true }),
        max: configService.get('cache.max', { infer: true }),
        ttl: configService.get('cache.ttl', { infer: true }),
        port: configService.get('cache.port', { infer: true }),
        auth_pass: configService.get('cache.auth_pass', { infer: true }),
        db: configService.get('cache.db', { infer: true }),
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),

    MailerModule.forRootAsync({
      useClass: MailConfigService,
    }),

    AuthModule,
    WebhookModule,
    VendorModule,
    AppCacheModule,
    SettingModule,
    ...BackofficeModules,
    ...UserCLientModules,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
