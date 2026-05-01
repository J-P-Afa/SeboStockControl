import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import {
  importBookCover,
  removeBookCover,
  resolveBookCoverUrl,
  uploadBookCover,
} from './books.api';

const API_URL = 'http://localhost:3001/api';

describe('books cover API', () => {
  it('resolves managed cover URLs against the backend origin', () => {
    expect(resolveBookCoverUrl('/uploads/book-covers/1/cover.png')).toBe(
      'http://localhost:3001/uploads/book-covers/1/cover.png',
    );
    expect(resolveBookCoverUrl('https://example.com/cover.png')).toBe(
      'https://example.com/cover.png',
    );
    expect(resolveBookCoverUrl(null)).toBeNull();
  });

  it('imports, uploads, and removes covers through the cover endpoints', async () => {
    server.use(
      http.post(`${API_URL}/books/1/cover/import`, async ({ request }) => {
        expect(await request.json()).toEqual({
          sourceUrl: 'https://example.com/cover.png',
        });
        return HttpResponse.json({
          success: true,
          data: { id: 1, title: 'Book', coverUrl: '/uploads/imported.png' },
        });
      }),
      http.post(`${API_URL}/books/1/cover`, () => {
        return HttpResponse.json({
          success: true,
          data: { id: 1, title: 'Book', coverUrl: '/uploads/uploaded.png' },
        });
      }),
      http.delete(`${API_URL}/books/1/cover`, () => {
        return HttpResponse.json({
          success: true,
          data: { id: 1, title: 'Book', coverUrl: null },
        });
      }),
    );

    await expect(
      importBookCover(1, 'https://example.com/cover.png'),
    ).resolves.toMatchObject({ coverUrl: '/uploads/imported.png' });
    await expect(
      uploadBookCover(1, new File(['image'], 'cover.png', { type: 'image/png' })),
    ).resolves.toMatchObject({ coverUrl: '/uploads/uploaded.png' });
    await expect(removeBookCover(1)).resolves.toMatchObject({ coverUrl: null });
  });
});
