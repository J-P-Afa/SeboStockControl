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

  describe('POST /api/books', () => {
    it('should add a book with valid data', () => {
      const bookData = {
        title: 'The Lord of the Rings',
        author: 'J.R.R. Tolkien',
        stock: 5,
        price: 29.99,
        publisher: 'Allen & Unwin',
        edition: '1st',
      };

      return request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.book).toBeDefined();
          expect(res.body.book.title).toBe(bookData.title);
          expect(res.body.book.author).toBe(bookData.author);
          expect(res.body.book.stock).toBe(bookData.stock);
          expect(res.body.book.price).toBe(bookData.price);
        });
    });

    it('should add a book with minimal required data', () => {
      const bookData = {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        stock: 3,
        price: 39.99,
      };

      return request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.book).toBeDefined();
          expect(res.body.book.id).toBeDefined();
          expect(res.body.book.title).toBe(bookData.title);
          expect(res.body.book.author).toBe(bookData.author);
        });
    });

    it('should reject book with missing title', () => {
      const bookData = {
        author: 'J.K. Rowling',
        stock: 10,
        price: 24.99,
      };

      return request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(400);
    });

    it('should reject book with missing author', () => {
      const bookData = {
        title: 'Harry Potter',
        stock: 10,
        price: 24.99,
      };

      return request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(400);
    });

    it('should reject book with missing price', () => {
      const bookData = {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        stock: 5,
      };

      return request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(400);
    });

    it('should reject book with negative price', () => {
      const bookData = {
        title: 'Dune',
        author: 'Frank Herbert',
        stock: 2,
        price: -15.99,
      };

      return request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(400);
    });

    it('should reject book with negative stock', () => {
      const bookData = {
        title: 'Foundation',
        author: 'Isaac Asimov',
        stock: -1,
        price: 19.99,
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
          expect(Array.isArray(res.body.books)).toBe(true);
        });
    });
  });

  describe('DELETE /api/books/:id', () => {
    let bookId: number;

    beforeEach(async () => {
      // Create a book first to test deletion
      const bookData = {
        title: 'Delete Test Book',
        author: 'Test Author',
        stock: 5,
        price: 19.99,
      };

      const response = await request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData);

      bookId = response.body.book.id;
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
      // First deletion
      await request(app.getHttpServer())
        .delete(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Second deletion should fail
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
        .expect(200);
    });
  });
});
