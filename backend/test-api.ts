import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
const request = require('supertest');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const response = await request(app.getHttpServer())
    .post('/tipos-entrada')
    .send({ descricao: 'Test Tipo', isDoacao: false, isActive: true });

  console.log('Status:', response.status);
  console.log('Body:', response.body);
  await app.close();
}
bootstrap();
