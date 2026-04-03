import { test as base } from '@playwright/test';

/**
 * Generates a fake but structurally valid JWT for testing.
 */
function generateFakeJwt(payload: object) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadBase64 = btoa(JSON.stringify(payload));
  // Keep padding as atob can be strict in some browsers
  return `${header}.${payloadBase64}.signature`;
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

      // Catalog mocks (Books, Genres, etc.)
      const path = new URL(url).pathname;

      if (path.endsWith('/api/auth/login') && method === 'POST') {
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

      if ((path.endsWith('/api/me') || path.endsWith('/api/users/me')) && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'admin-id',
              email: 'admin@admin.com',
              name: 'Admin User',
              role: 'ADMIN',
            },
          }),
        });
      }

      // Dashboard mocks
      if (path.endsWith('/api/dashboard/kpis') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              totalVendas: 15750.5,
              lucroLiquido: 4230.2,
              margemLucro: 26.8,
              ticketMedio: 85.5,
            },
          }),
        });
      }

      if (path.endsWith('/api/dashboard/sales-trend') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { date: new Date().toISOString(), totalSales: 1000, netProfit: 300 },
            ],
          }),
        });
      }

      if (path.endsWith('/api/dashboard/top-categories') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { category: 'Ficção', totalSales: 5000, netProfit: 1500 },
            ],
          }),
        });
      }

      if (path.endsWith('/api/dashboard/recent-transactions') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 1, bookName: 'O Senhor dos Anéis', date: new Date().toISOString(), totalValue: 150, profit: 45 },
            ],
          }),
        });
      }

      if (path.endsWith('/api/books') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: '1', title: 'O Senhor dos Anéis', author: 'J.R.R. Tolkien', status: 'COMPLETO', stockQuantity: 10, weight: 500 },
              { id: '2', title: 'Dom Casmurro', author: 'Machado de Assis', status: 'PENDENTE', stockQuantity: 5, weight: 300 },
            ],
          }),
        });
      }

      if (path.endsWith('/api/users') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              items: [{ id: 'admin-id', name: 'Admin User', email: 'admin@admin.com', role: 'ADMIN' }],
              total: 1,
              totalPages: 1,
              page: 1,
              limit: 10,
            },
          }),
        });
      }

      if (path.endsWith('/api/roles') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: '1', name: 'ADMIN', permissions: [] },
            ],
          }),
        });
      }

      if (path.endsWith('/api/genres') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 1, name: 'Ficção' },
              { id: 2, name: 'Não-Ficção' },
            ],
          }),
        });
      }

      if (path.endsWith('/api/languages') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 1, name: 'Português' },
              { id: 2, name: 'Inglês' },
            ],
          }),
        });
      }

      if (path.endsWith('/api/publishers') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 1, name: 'Companhia das Letras' },
              { id: 2, name: 'Rocco' },
            ],
          }),
        });
      }

      if (path.endsWith('/api/canais-venda') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 1, name: 'Loja Física' },
              { id: 2, name: 'Estante Virtual' },
            ],
          }),
        });
      }

      if (path.endsWith('/api/formas-pagamento') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 1, name: 'Dinheiro' },
              { id: 2, name: 'Cartão de Crédito' },
            ],
          }),
        });
      }

      if (path.endsWith('/api/tipos-saida') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 1, name: 'Venda' },
              { id: 2, name: 'Avaria' },
            ],
          }),
        });
      }

      if (path.endsWith('/api/roles/permissions') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 'perm-1', action: 'user:read', description: 'Read users', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              { id: 'perm-2', action: 'user:create', description: 'Create users', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            ],
          }),
        });
      }
      
      // Default fallback for other GET requests to return empty data instead of 404
      if (method === 'GET') {
        console.log(`[MSW] Unmatched GET request: ${url}`);
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              items: [],
              total: 0,
              totalPages: 0,
              page: 1,
              limit: 10,
            },
          }),
        });
      }

      // Default for POST/PUT/DELETE
      if (['POST', 'PUT', 'DELETE'].includes(method)) {
         console.log(`[MSW] Unmatched ${method} request: ${url}`);
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
