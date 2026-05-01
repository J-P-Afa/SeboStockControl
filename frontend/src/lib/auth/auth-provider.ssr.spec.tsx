// @vitest-environment node

import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AuthProvider } from './auth-provider';
import { useAuth } from '@/hooks/use-auth';

function ServerAuthState() {
  const { isLoading, user } = useAuth();

  return (
    <span>
      {isLoading ? 'loading' : 'ready'}:{user ? user.email : 'no-user'}
    </span>
  );
}

describe('AuthProvider SSR initialization', () => {
  it('starts loading with no user when window is unavailable', () => {
    const html = renderToString(
      <AuthProvider>
        <ServerAuthState />
      </AuthProvider>,
    );

    expect(html).toContain('loading');
    expect(html).toContain('no-user');
  });
});
