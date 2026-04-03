import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ResultInterceptor, HttpExceptionFilter } from '../src/common';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
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
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResultInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/auth/login (POST) - should reject invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrong' })
      .expect(401);
  });
});

describe('Book (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let genreId: number;
  let languageId: number;
  let publisherId: number;

  beforeAll(async () => {
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
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResultInterceptor());
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@admin.com',
        password: 'admin123',
      });

    authToken = loginRes.body.data.accessToken;

    const genreRes = await request(app.getHttpServer())
      .post('/api/genres')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: `Fantasy ${Date.now()}` });

    genreId = genreRes.body.data.id;

    const languageRes = await request(app.getHttpServer())
      .post('/api/languages')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: `English ${Date.now()}` });

    languageId = languageRes.body.data.id;

    const publisherRes = await request(app.getHttpServer())
      .post('/api/publishers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: `Allen & Unwin ${Date.now()}` });

    publisherId = publisherRes.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/books', () => {
    it('should add a book with valid data', () => {
      const bookData = {
        title: `The Lord of the Rings ${Date.now()}`,
        editionType: 'normal',
        condition: 'novo',
        status: 'completo',
        weight: 1.5,
        publisherId,
        languageId,
        genreId,
      };

      return request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.title).toBe(bookData.title);
        });
    });

    it('should add a book with minimal required data', () => {
      const bookData = {
        title: `Clean Code ${Date.now()}`,
        editionType: 'normal',
        condition: 'novo',
        status: 'completo',
        weight: 1.2,
        publisherId,
        languageId,
        genreId,
      };

      return request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.title).toBe(bookData.title);
        });
    });

    it('should reject book with missing title', () => {
      const bookData = {
        editionType: 'normal',
        condition: 'novo',
        status: 'completo',
        weight: 1.0,
        publisherId,
        languageId,
        genreId,
      };

      return request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(400);
    });

    it('should reject book with negative weight', () => {
      const bookData = {
        title: 'Dune',
        editionType: 'normal',
        condition: 'novo',
        status: 'completo',
        weight: -10.5,
        publisherId,
        languageId,
        genreId,
      };

      return request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(400);
    });

    it('should allow same ISBN for different conditions', async () => {
      const isbn = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(
        -13,
      );

      await request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Book Novo',
          isbn13: isbn,
          editionType: 'normal',
          condition: 'novo',
          status: 'completo',
          weight: 1,
          publisherId,
          languageId,
          genreId,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Book Usado',
          isbn13: isbn,
          editionType: 'normal',
          condition: 'usado',
          status: 'completo',
          weight: 1,
          publisherId,
          languageId,
          genreId,
        })
        .expect(201);
    });

    it('should NOT allow duplicate ISBN for same condition', async () => {
      const isbn = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(
        -13,
      );

      await request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Book 1',
          isbn13: isbn,
          editionType: 'normal',
          condition: 'novo',
          status: 'completo',
          weight: 1,
          publisherId,
          languageId,
          genreId,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Book 2',
          isbn13: isbn,
          editionType: 'normal',
          condition: 'novo',
          status: 'completo',
          weight: 1,
          publisherId,
          languageId,
          genreId,
        })
        .expect(409); // Corrected to 409 Conflict
    });

    it('should reject invalid enum values', () => {
      return request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Enum',
          editionType: 'INVALID',
          condition: 'novo',
          status: 'completo',
          weight: 1,
          publisherId,
          languageId,
          genreId,
        })
        .expect(400);
    });
  });

  describe('GET /api/books', () => {
    it('should retrieve all books', () => {
      return request(app.getHttpServer())
        .get('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter books by title', async () => {
      const uniqueTitle = `Unique Filter Book ${Date.now()}`;
      await request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: uniqueTitle,
          editionType: 'normal',
          condition: 'novo',
          status: 'completo',
          weight: 1,
          publisherId,
          languageId,
          genreId,
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/api/books?search=${encodeURIComponent(uniqueTitle)}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].title).toBe(uniqueTitle);
    });
  });

  describe('DELETE /api/books/:id', () => {
    it('should successfully delete an existing book', async () => {
      // Create a fresh book to delete
      const bookData = {
        title: `Delete Test Book ${Date.now()}`,
        editionType: 'normal',
        condition: 'novo',
        status: 'completo',
        weight: 1.0,
        publisherId,
        languageId,
        genreId,
      };

      const createRes = await request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201);

      const bookId = createRes.body.data.id;

      return request(app.getHttpServer())
        .delete(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should return error when trying to delete non-existent book', () => {
      const nonExistentId = 999999;

      return request(app.getHttpServer())
        .delete(`/api/books/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.message).toBe('Book não encontrado');
        });
    });

    it('should handle deletion of already deleted book', async () => {
      // Create a fresh book to delete twice
      const bookData = {
        title: `Delete Twice Book ${Date.now()}`,
        editionType: 'normal',
        condition: 'novo',
        status: 'completo',
        weight: 1.0,
        publisherId,
        languageId,
        genreId,
      };

      const createRes = await request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201);

      const bookId = createRes.body.data.id;

      await request(app.getHttpServer())
        .delete(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      return request(app.getHttpServer())
        .delete(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should reject deletion with invalid ID format', () => {
      return request(app.getHttpServer())
        .delete('/api/books/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});

describe('Genre (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;

  beforeAll(async () => {
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
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResultInterceptor());
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@admin.com',
        password: 'admin123',
      });

    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a genre', () => {
    const description = `Science Fiction ${Date.now()}`;
    return request(app.getHttpServer())
      .post('/api/genres')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.description).toBe(description);
      });
  });

  it('should list genres', async () => {
    const description = `Mystery ${Date.now()}`;
    await request(app.getHttpServer())
      .post('/api/genres')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description })
      .expect(201);

    return request(app.getHttpServer())
      .get('/api/genres')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.items)).toBe(true);
      });
  });
});

describe('Language (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;

  beforeAll(async () => {
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
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResultInterceptor());
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@admin.com',
        password: 'admin123',
      });

    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a language', () => {
    const description = `Portuguese ${Date.now()}`;
    return request(app.getHttpServer())
      .post('/api/languages')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.description).toBe(description);
      });
  });

  it('should list languages', async () => {
    const description = `Spanish ${Date.now()}`;
    await request(app.getHttpServer())
      .post('/api/languages')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description })
      .expect(201);

    return request(app.getHttpServer())
      .get('/api/languages')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.items)).toBe(true);
      });
  });
});

describe('Publisher (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;

  beforeAll(async () => {
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
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResultInterceptor());
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@admin.com',
        password: 'admin123',
      });

    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a publisher', () => {
    const description = `Penguin Random House ${Date.now()}`;
    return request(app.getHttpServer())
      .post('/api/publishers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.description).toBe(description);
      });
  });

  it('should list publishers', async () => {
    const description = `HarperCollins ${Date.now()}`;
    await request(app.getHttpServer())
      .post('/api/publishers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description })
      .expect(201);

    return request(app.getHttpServer())
      .get('/api/publishers')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.items)).toBe(true);
      });
  });
});
