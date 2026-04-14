import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ¡ESTA LÍNEA ES VITAL! Permite que el frontend se conecte
  app.enableCors();

  await app.listen(3000);
}
bootstrap();