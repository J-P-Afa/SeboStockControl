import { test, expect } from '@playwright/test';

// Reset storage state for login tests as we want to start logged out
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /Entrar/i }).click();

    await expect(page.getByText(/Email inválido/i)).toBeVisible();
    await expect(page.getByText(/Senha é obrigatória/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/Email/i).fill('wrong@test.com');
    await page.getByLabel(/Senha/i).fill('wrongpassword');
    await page.getByRole('button', { name: /Entrar/i }).click();

    // Check for error toast or alert
    // Based on unit tests, there should be an alert or toast with "Email ou senha inválidos"
    await expect(page.getByText(/Email ou senha inválidos/i)).toBeVisible();
  });

  test('should successfully login and redirect', async ({ page }) => {
    await page.getByLabel(/Email/i).fill('admin@admin.com');
    await page.getByLabel(/Senha/i).fill('admin123');
    await page.getByRole('button', { name: /Entrar/i }).click();

    // Should redirect to dashboard (e.g. /users)
    await page.waitForURL(url => url.pathname !== '/login');
    expect(page.url()).not.toContain('/login');
  });
});
