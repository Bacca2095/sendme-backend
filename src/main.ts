import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { hash } from 'argon2';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { environment } from './shared/env/environment';

const configureApp = (app: INestApplication): void => {
  app.enableCors();
  app.use(helmet());
  app.setGlobalPrefix('api');
};

const configureLogger = (app: INestApplication): void => {
  const logger: Logger = app.get(Logger);
  app.useLogger(logger);
};

const configureSwaggerGeneral = (app: INestApplication): void => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sendme API')
    .setDescription('API documentation for Sendme application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
};

const configureSwaggerAdmin = (app: INestApplication): void => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sendme API for Admin')
    .setDescription('API documentation for Sendme application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/admin/api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
};

const configureGlobalPipes = (app: INestApplication): void => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
};

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bufferLogs: true,
  });
  const logger: Logger = app.get(Logger);

  console.log(await hash('Leonardo20'));

  configureApp(app);
  configureLogger(app);
  configureSwaggerGeneral(app);
  configureSwaggerAdmin(app);
  configureGlobalPipes(app);

  await app.listen(environment.port);
  logger.log(`🚀 Application is running at: ${await app.getUrl()}/api`);
};

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
