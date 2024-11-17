import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exception-filter/http.exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // swagger
  const config = new DocumentBuilder()
    .setTitle('my first nestjs')
    .setDescription('NestJS 스터디입니다.')
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-ui', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 앱 전체에 사용되는 밸리데이터들이 실행되도록 하는 파이프
  app.useGlobalPipes(
    new ValidationPipe({
      // 쿼리 등에 실제로 값이 없는데
      // 기본값을 설정한다거나 하면
      // 변형이 일어나는 것이므로
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true, // 데코레이터 처리되지 않은 요청은 무시
      forbidNonWhitelisted: true, // 무시는 하되 에러는 던짐
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
