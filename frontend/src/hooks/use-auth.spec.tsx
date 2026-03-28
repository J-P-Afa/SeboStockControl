import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from './use-auth';
import { AuthProvider } from '@/lib/auth/auth-provider';

// Mock the API for AuthProvider since it calls getAccessToken on mount
vi.mock('@/lib/api', () => ({
  getAccessToken: vi.fn(() => null),
  login: vi.fn(),
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
}));

describe('useAuth hook', () => {
  it('should throw error when used outside of AuthProvider', () => {
    // Suppress console.error for this test as React will log the error when it catches it
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });

  it('should return auth context when used within AuthProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
    expect(result.current.login).toBeDefined();
    expect(result.current.logout).toBeDefined();
  });
});
