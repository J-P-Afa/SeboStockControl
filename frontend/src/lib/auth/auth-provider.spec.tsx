import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, parseJwtPayload } from './auth-provider';
import { useAuth } from '@/hooks/use-auth';
import { http, HttpResponse } from 'msw';
import { server } from '@/lib/api/mocks/server';

const API_URL = 'http://localhost:3001/api';

// Helper component to test useAuth within AuthProvider
function TestComponent() {
  const { user, login, logout, isLoading } = useAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={() => login({ email: 'test@test.com', password: 'password' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthProvider & useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with no user and not loading after mount', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });
  });

  it('should restore user if token exists in localStorage on mount', async () => {
    const mockToken = 'header.' + btoa(JSON.stringify({ sub: '1', email: 'stored@test.com', role: 'user' })) + '.signature';
    localStorage.setItem('accessToken', mockToken);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('stored@test.com');
    });
  });

  it('should login successfully and update user state', async () => {
    const mockToken = 'header.' + btoa(JSON.stringify({ sub: '2', email: 'test@test.com', role: 'ADMIN' })) + '.signature';
    
    // MSW will use the default handler from handlers.ts, but we can override it here if needed
    // In this case, our handlers.ts already returns a fake-access-token.
    // Let's override it to return our mockToken for the test.
    server.use(
      http.post(`${API_URL}/auth/login`, () => {
        return HttpResponse.json({
          accessToken: mockToken,
          refreshToken: 'refresh',
          user: {
            id: 'user-2',
            email: 'test@test.com',
            name: 'Test User',
            role: 'ADMIN',
          },
        });
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const user = userEvent.setup();
    const loginButton = screen.getByText('Login');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    });

    expect(localStorage.getItem('accessToken')).toBe(mockToken);
  });

  it('should handle logout', async () => {
    const mockToken = 'header.' + btoa(JSON.stringify({ sub: '1', email: 'test@test.com' })) + '.signature';
    localStorage.setItem('accessToken', mockToken);
    
    // Mock window.location using vi.stubGlobal
    const locationStub = { href: '' };
    vi.stubGlobal('location', locationStub as unknown as Location);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const user = userEvent.setup();
    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(locationStub.href).toBe('/login');
    });

    expect(localStorage.getItem('accessToken')).toBeNull();

    // Cleanup
    vi.unstubAllGlobals();
  });
});

describe('parseJwtPayload', () => {
  it('parses permissions when present and defaults them when omitted', () => {
    const tokenWithPermissions =
      'header.' +
      btoa(
        JSON.stringify({
          sub: '1',
          email: 'admin@test.com',
          role: 'ADMIN',
          permissions: ['books:read'],
        }),
      ) +
      '.signature';
    const tokenWithoutPermissions =
      'header.' +
      btoa(
        JSON.stringify({
          sub: '2',
          email: 'user@test.com',
          role: 'USER',
        }),
      ) +
      '.signature';

    expect(parseJwtPayload(tokenWithPermissions)).toEqual({
      id: '1',
      email: 'admin@test.com',
      role: 'ADMIN',
      permissions: ['books:read'],
    });
    expect(parseJwtPayload(tokenWithoutPermissions)).toEqual({
      id: '2',
      email: 'user@test.com',
      role: 'USER',
      permissions: [],
    });
  });

  it('returns null for malformed tokens', () => {
    expect(parseJwtPayload('not-a-jwt')).toBeNull();
  });
});
