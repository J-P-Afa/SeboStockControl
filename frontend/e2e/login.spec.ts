import { test, expect } from './fixtures/msw.fixture';

// Reset storage state for login tests as we want to start logged out
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Ensure we are actually on the login page and it's hydrated
    await expect(page.getByRole('heading', { name: /Sebo Alfa/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Wait for the button to be stable
    const loginButton = page.getByRole('button', { name: /Entrar/i });
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    await expect(page.getByText(/Email inválido/i)).toBeVisible();
    await expect(page.getByText(/Senha é obrigatória/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/Email/i).fill('wrong@test.com');
    await page.getByLabel(/Senha/i).fill('wrongpassword');
    await page.getByRole('button', { name: /Entrar/i }).click();

    // Check for error toast or alert
    await expect(page.getByRole('alert').filter({ hasText: /Email ou senha inválidos/i })).toBeVisible();
  });

  test('should successfully login and redirect', async ({ page }) => {
    await page.getByLabel(/Email/i).fill('admin@admin.com');
    await page.getByLabel(/Senha/i).fill('admin123');
    const loginButton = page.getByRole('button', { name: /Entrar/i });
    await loginButton.click();

    // Should redirect to dashboard
    await page.waitForURL(url => url.pathname !== '/login', { timeout: 15000 });
    expect(page.url()).not.toContain('/login');
  });
});
