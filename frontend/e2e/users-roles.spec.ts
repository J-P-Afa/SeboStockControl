import { test, expect } from './fixtures/msw.fixture';

test.describe('User and Role Management', () => {
  test('should list users', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: /Usuários/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
  });

  test('should search for a user', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
    const searchInput = page.getByPlaceholder(/Buscar por nome ou e-mail/i);
    await searchInput.fill('Admin');
    // Verify search input value
    await expect(searchInput).toHaveValue('Admin');
  });

  test('should open create user dialog', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Novo Usuário/i }).click();
    await expect(page.getByRole('heading', { name: /Novo Usuário/i })).toBeVisible();
    await page.getByRole('button', { name: /Cancelar/i }).click();
  });

  test('should list roles', async ({ page }) => {
    await page.goto('/roles');
    await expect(page.getByRole('heading', { name: /Gerenciar Perfis/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
  });

  test('should open create role dialog', async ({ page }) => {
    await page.goto('/roles');
    await page.getByRole('button', { name: /Novo Perfil/i }).click();
    await expect(page.getByRole('heading', { name: /Novo Perfil/i })).toBeVisible();
  });
});
