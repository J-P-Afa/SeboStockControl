import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
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

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@admin.com',
        password: 'admin123',
      });

    authToken = loginRes.body.accessToken;

    const genreRes = await request(app.getHttpServer())
      .post('/api/genres')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'Fantasy' });

    genreId = genreRes.body.genre.id;

    const languageRes = await request(app.getHttpServer())
      .post('/api/languages')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'English' });

    languageId = languageRes.body.language.id;

    const publisherRes = await request(app.getHttpServer())
      .post('/api/publishers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'Allen & Unwin' });

    publisherId = publisherRes.body.publisher.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/books', () => {
    it('should add a book with valid data', () => {
      const bookData = {
        title: 'The Lord of the Rings',
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
          expect(res.body.data.editionType).toBe(bookData.editionType);
          expect(res.body.data.condition).toBe(bookData.condition);
          expect(res.body.data.status).toBe(bookData.status);
          expect(res.body.data.publisherId).toBe(bookData.publisherId);
          expect(res.body.data.languageId).toBe(bookData.languageId);
          expect(res.body.data.genreId).toBe(bookData.genreId);
        });
    });

    it('should add a book with minimal required data', () => {
      const bookData = {
        title: 'Clean Code',
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

    it('should reject book with missing publisherId', () => {
      const bookData = {
        title: 'Harry Potter',
        editionType: 'normal',
        condition: 'novo',
        status: 'completo',
        weight: 1.0,
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
  });

  describe('DELETE /api/books/:id', () => {
    let bookId: number;

    beforeEach(async () => {
      const bookData = {
        title: 'Delete Test Book',
        editionType: 'normal',
        condition: 'novo',
        status: 'completo',
        weight: 1.0,
        publisherId,
        languageId,
        genreId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData);

      bookId = response.body.data.id;
    });

    it('should successfully delete an existing book', () => {
      return request(app.getHttpServer())
        .delete(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should return error when trying to delete non-existent book', () => {
      const nonExistentId = 99999;

      return request(app.getHttpServer())
        .delete(`/api/books/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error).toBe('Livro não encontrado');
        });
    });

    it('should handle deletion of already deleted book', async () => {
      await request(app.getHttpServer())
        .delete(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      return request(app.getHttpServer())
        .delete(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error).toBe('Livro não encontrado');
        });
    });

    it('should reject deletion with invalid ID format', () => {
      return request(app.getHttpServer())
        .delete('/api/books/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should allow same ISBN for different conditions', async () => {
  const isbn = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-13);

  const book1 = await request(app.getHttpServer())
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

  const book2 = await request(app.getHttpServer())
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

  expect(book1.body.success).toBe(true);
  expect(book2.body.success).toBe(true);
});

it('should NOT allow duplicate ISBN for same condition', async () => {
  const isbn = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-13);

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
      .expect(400);
    });

    it('should filter books by title', async () => {
  await request(app.getHttpServer())
    .post('/api/books')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      title: 'Unique Filter Book',
      editionType: 'normal',
      condition: 'novo',
      status: 'completo',
      weight: 1,
      publisherId,
      languageId,
      genreId,
    });

  const res = await request(app.getHttpServer())
    .get('/api/books?title=Unique')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);

  expect(res.body.data.length).toBeGreaterThan(0);
  expect(res.body.data[0].title).toContain('Unique');
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
});


describe('Genre (e2e)', () => {
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

  it('should create a genre', () => {
    return request(app.getHttpServer())
      .post('/api/genres')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'Science Fiction' })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.genre).toBeDefined();
        expect(res.body.genre.description).toBe('Science Fiction');
      });
  });

  it('should list genres', async () => {
    await request(app.getHttpServer())
      .post('/api/genres')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'Mystery' });

    return request(app.getHttpServer())
      .get('/api/genres')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.genres)).toBe(true);
      });
  });
});

describe('Language (e2e)', () => {
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

  it('should create a language', () => {
    return request(app.getHttpServer())
      .post('/api/languages')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'Portuguese' })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.language).toBeDefined();
        expect(res.body.language.description).toBe('Portuguese');
      });
  });

  it('should list languages', async () => {
    await request(app.getHttpServer())
      .post('/api/languages')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'Spanish' });

    return request(app.getHttpServer())
      .get('/api/languages')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.languages)).toBe(true);
      });
  });
});

describe('Publisher (e2e)', () => {
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

  it('should create a publisher', () => {
    return request(app.getHttpServer())
      .post('/api/publishers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'Penguin Random House' })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.publisher).toBeDefined();
        expect(res.body.publisher.description).toBe('Penguin Random House');
      });
  });

  it('should list publishers', async () => {
    await request(app.getHttpServer())
      .post('/api/publishers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'HarperCollins' });

    return request(app.getHttpServer())
      .get('/api/publishers')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.publishers)).toBe(true);
      });
  });
});
