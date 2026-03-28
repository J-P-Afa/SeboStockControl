import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3001/api';

export const handlers = [
  // Auth
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { email } = (await request.json()) as { email: string };
    
    if (email === 'error@example.com') {
      return new HttpResponse(null, { status: 401 });
    }

    return HttpResponse.json({
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token',
      user: {
        id: 'user-1',
        email,
        name: 'Test User',
        role: 'ADMIN',
      },
    });
  }),

  http.post(`${API_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: 'new-fake-access-token',
      refreshToken: 'new-fake-refresh-token',
    });
  }),

  // User
  http.get(`${API_URL}/me`, () => {
    return HttpResponse.json({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN',
    });
  }),
];
