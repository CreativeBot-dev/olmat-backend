import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AllConfigType } from './shared/types/config.type';
import { ConfigService } from '@nestjs/config';
import { BackofficeModules } from './app-backoffice/module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import helmet from 'helmet';
import validationOptions from './shared/utils/validation-options';
import * as basicAuth from 'express-basic-auth';
import { UserCLientModules } from './app-client/module';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.useStaticAssets(path.join(__dirname, '../storage/'));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Use helmet
  app.use(helmet.hidePoweredBy());
  app.use(
    helmet({
      xPoweredBy: false,
    }),
  );

  // Swagger AUth
  if (process.env.NODE_ENV !== 'development') {
    app.use(
      ['/docs'],
      basicAuth({
        challenge: true,
        realm: 'Swagger',
        users: {
          admin: String(process.env.SWAGGER_SECRET),
        },
      }),
    );
  }

  // Backoffice Swagger
  SwaggerModule.setup(
    'docs/backoffice',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('API Backoffce')
        .setDescription('API Backoffce docs')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
      {
        include: BackofficeModules,
      },
    ),
    {
      swaggerOptions: {
        persistAuthorization: true,
      },
    },
  );

  // User Swagger
  SwaggerModule.setup(
    'docs/user',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('API User')
        .setDescription('API User docs')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
      {
        include: UserCLientModules,
      },
    ),
    {
      swaggerOptions: {
        persistAuthorization: true,
      },
    },
  );

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
bootstrap();
