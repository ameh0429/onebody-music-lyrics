import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { documentApi } from './common/openapi';
import { ApiErrorFilter } from './common/api-error.filter';
import { uploadDirectory } from './common/upload';

export async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new ApiErrorFilter());
  app.useStaticAssets(uploadDirectory, { prefix: '/uploads/' });
  app.enableShutdownHooks();
  const config = new DocumentBuilder()
    .setTitle('Onebody Music Lyrics API')
    .setDescription(
      'Manage artistes, albums, songs and user accounts. Public music reads; bearer JWT required for writes. Image uploads accept JPEG, PNG, GIF or WebP, up to 5 MiB.',
    )
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  documentApi(document);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: '/docs-json',
    swaggerOptions: { persistAuthorization: true },
  });
  return app;
}
