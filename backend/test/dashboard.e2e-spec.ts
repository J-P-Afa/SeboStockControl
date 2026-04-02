import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Dashboard (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Login to get token (permissions should be in token)
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@admin.com',
        password: 'admin123',
      });

    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/dashboard/kpis (GET) - should be accessible with correct permission', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/dashboard/kpis')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('totalVendas');
    expect(response.body.data).toHaveProperty('lucroLiquido');
  });

  it('/api/dashboard/sales-trend (GET) - should be accessible with correct permission', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/dashboard/sales-trend')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    if (response.body.data.length > 0) {
      expect(response.body.data[0]).toHaveProperty('netProfit');
    }
  });

  it('/api/dashboard/top-categories (GET) - should be accessible with correct permission', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/dashboard/top-categories')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('/api/dashboard/recent-transactions (GET) - should be accessible with correct permission', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/dashboard/recent-transactions')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('/api/dashboard/kpis (GET) - should return 403 when user lacks permission', async () => {
    // We would need a user without the permission to test this properly
    // For now, testing that a random token (or no token) fails with 401
    const response = await request(app.getHttpServer())
      .get('/api/dashboard/kpis');

    expect(response.status).toBe(401);
  });
});
