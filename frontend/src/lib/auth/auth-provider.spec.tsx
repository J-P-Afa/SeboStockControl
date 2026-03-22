import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from './auth-provider';
import { useAuth } from '@/hooks/use-auth';
import * as api from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api', () => ({
  login: vi.fn(),
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
  getAccessToken: vi.fn(),
}));

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
    vi.clearAllMocks();
    // Default mock for getAccessToken (empty)
    (api.getAccessToken as any).mockReturnValue(null);
  });

  it('should initialize with no user and not loading after mount', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('should restore user if token exists in localStorage on mount', async () => {
    const mockToken = 'header.' + btoa(JSON.stringify({ sub: '1', email: 'stored@test.com', role: 'user' })) + '.signature';
    (api.getAccessToken as any).mockReturnValue(mockToken);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('stored@test.com');
  });

  it('should login successfully and update user state', async () => {
    const mockToken = 'header.' + btoa(JSON.stringify({ sub: '2', email: 'new@test.com', role: 'admin' })) + '.signature';
    (api.login as any).mockResolvedValue({ accessToken: mockToken, refreshToken: 'refresh' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
      expect(api.setTokens).toHaveBeenCalled();
      expect(screen.getByTestId('user')).toHaveTextContent('new@test.com');
    });
  });

  it('should handle logout', async () => {
    const mockToken = 'header.' + btoa(JSON.stringify({ sub: '1', email: 'test@test.com' })) + '.signature';
    (api.getAccessToken as any).mockReturnValue(mockToken);
    
    // Mock window.location using vi.stubGlobal
    const locationStub = { href: '' };
    vi.stubGlobal('location', locationStub);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const user = userEvent.setup();
    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(api.clearTokens).toHaveBeenCalled();
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(locationStub.href).toBe('/login');
    });

    // Cleanup
    vi.unstubAllGlobals();
  });
});
