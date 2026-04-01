import { test as base } from '@playwright/test';

/**
 * Generates a fake but structurally valid JWT for testing.
 */
function generateFakeJwt(payload: object) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, '');
  return `header.${payloadBase64}.signature`;
}

const FAKE_ADMIN_TOKEN = generateFakeJwt({
  sub: 'admin-id',
  email: 'admin@admin.com',
  role: 'ADMIN',
  permissions: ['user:read', 'user:create', 'user:update', 'user:delete'],
});

/**
 * Custom fixture that sets up Playwright's native routing to handle 
 * requests using mocked responses.
 */
export const test = base.extend<{
  mockApi: void;
}>({
  mockApi: [async ({ page }, use) => {
    // Intercept all requests to the API
    await page.route('**/api/**', async (route) => {
      const request = route.request();
      const url = request.url();
      const method = request.method();
      const body = request.postDataJSON();

      // Auth mocks
      if (url.includes('/auth/login') && method === 'POST') {
        const { email } = body || {};
        if (email === 'admin@admin.com') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              accessToken: FAKE_ADMIN_TOKEN,
              refreshToken: 'fake-refresh-token',
              user: {
                id: 'admin-id',
                email: 'admin@admin.com',
                name: 'Admin User',
                role: 'ADMIN',
              },
            }),
          });
        }
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ code: 'AUTH_INVALID_CREDENTIALS', message: 'Email ou senha inválidos' }),
        });
      }

      if (url.includes('/me') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'admin-id',
            email: 'admin@admin.com',
            name: 'Admin User',
            role: 'ADMIN',
          }),
        });
      }

      // Catalog mocks (Books, Genres, etc.)
      if (url.includes('/books') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              { id: '1', title: 'O Senhor dos Anéis', author: 'J.R.R. Tolkien', status: 'COMPLETO', stockQuantity: 10, weight: 500 },
              { id: '2', title: 'Dom Casmurro', author: 'Machado de Assis', status: 'PENDENTE', stockQuantity: 5, weight: 300 },
            ],
            total: 2,
            totalPages: 1,
            page: 1,
          }),
        });
      }

      if (url.includes('/users') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [{ id: 'admin-id', name: 'Admin User', email: 'admin@admin.com', role: 'ADMIN' }],
            total: 1,
            totalPages: 1,
          }),
        });
      }

      if (url.includes('/roles') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: '1', name: 'ADMIN', permissions: [] },
          ]),
        });
      }
      
      // Default fallback for other GET requests to return empty data instead of 404
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [], data: [], total: 0, totalPages: 0 }),
        });
      }

      // Default for POST/PUT/DELETE
      if (['POST', 'PUT', 'DELETE'].includes(method)) {
         return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: {} }),
         });
      }

      await route.continue();
    });

    await use();
  }, { auto: true }],
});

export { expect } from '@playwright/test';
