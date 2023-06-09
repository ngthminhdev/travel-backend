import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ExceptionResponse } from './exceptions/common.exception';
import { UtilCommonTemplate } from './utils/utils.common';
import { ValidationFilter } from './filters/validation.filter';
import * as cookieParser from 'cookie-parser';
import { HttpLoggerInterceptor } from './interceptors/http-logger.interceptor';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(AppModule, {
      bodyParser: true,
    });

  app.enable('trust proxy');

  app.enableCors({
    origin: process.env.WHITELIST_IPS.split(','), // add your IP whitelist here
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders:
      'Origin,X-Requested-With,Content-Type,Accept,Authorization,mac',
  });
  // app.enableCors({origin: '*'})

  app.setGlobalPrefix(process.env.API_PREFIX);
  app.set('trust proxy', true);

  app.use(cookieParser());
  app.useGlobalInterceptors(new HttpLoggerInterceptor());
  app.useGlobalFilters(new ValidationFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory(errors: ValidationError[]) {
        return new ExceptionResponse(
          HttpStatus.BAD_REQUEST,
          UtilCommonTemplate.getMessageValidator(errors),
        );
      },
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .addBearerAuth()
    .addCookieAuth()
    .setTitle('Travel Swagger')
    .setDescription('Author: Đăng Kim Liên')
    .setContact(
      'Đặng Kim Liên',
      'https://www.facebook.com/dangkimlienn',
      'kimlienc15@gmail.com',
    )
    .setVersion('1.0')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Travel Swagger',
  });

  await app.listen(parseInt(process.env.SERVER_PORT)).then((): void => {
    console.log(
      `Server is running at ${process.env.SERVER_HOST}:${process.env.SERVER_PORT} --version: 0.0.16`,
    );
  });
}

bootstrap();
