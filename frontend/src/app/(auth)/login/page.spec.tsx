import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './page';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('LoginPage Organism', () => {
  const mockPush = vi.fn();
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useAuth as any).mockReturnValue({ login: mockLogin });
  });

  it('should render the login form', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Sebo Stock/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    await user.click(screen.getByRole('button', { name: /Entrar/i }));

    expect(await screen.findByText(/Email inválido/i)).toBeInTheDocument();
    expect(await screen.findByText(/Senha é obrigatória/i)).toBeInTheDocument();
  });

  it('should call login and redirect on success', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);
    
    render(<LoginPage />);
    
    await user.type(screen.getByLabelText(/Email/i), 'admin@admin.com');
    await user.type(screen.getByLabelText(/Senha/i), 'admin123');
    await user.click(screen.getByRole('button', { name: /Entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@admin.com',
        password: 'admin123',
      });
      expect(mockPush).toHaveBeenCalledWith('/users');
    });
  });

  it('should show error toast and message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Email ou senha inválidos';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<LoginPage />);
    
    await user.type(screen.getByLabelText(/Email/i), 'wrong@test.com');
    await user.type(screen.getByLabelText(/Senha/i), 'password');
    await user.click(screen.getByRole('button', { name: /Entrar/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
  });

  it('should show loading spinner while logging in', async () => {
    const user = userEvent.setup();
    // Use a promise that doesn't resolve immediately to check loading state
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    mockLogin.mockReturnValueOnce(loginPromise);
    
    render(<LoginPage />);
    
    await user.type(screen.getByLabelText(/Email/i), 'admin@admin.com');
    await user.type(screen.getByLabelText(/Senha/i), 'admin123');
    await user.click(screen.getByRole('button', { name: /Entrar/i }));

    // Check for spinner (Loader2 has animate-spin class)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    // Resolve login and check if spinner is gone
    resolveLogin!(undefined);
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
