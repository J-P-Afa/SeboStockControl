import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
const request = require('supertest');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  // Login to get token
  const loginRes = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: 'admin@admin.com', password: 'password123' }); // Adjust if needed

  console.log('Login:', loginRes.body);

  const token = loginRes.body.data?.accessToken;

  if (token) {
    const response = await request(app.getHttpServer())
      .post('/tipos-entrada')
      .set('Authorization', `Bearer ${token}`)
      .send({ descricao: 'Test Tipo', isDoacao: false, isActive: true });

    console.log('Status:', response.status);
    console.log('Body:', response.body);
  }
  await app.close();
}
bootstrap();
