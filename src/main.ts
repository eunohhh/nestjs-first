import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
