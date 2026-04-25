import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔥 AGREGAMOS ESTA LÍNEA PARA PERMITIR QUE REACT SE COMUNIQUE
  app.enableCors();

  await app.listen(3000);
}
bootstrap();