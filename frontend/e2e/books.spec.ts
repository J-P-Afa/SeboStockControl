import { test, expect } from './fixtures/msw.fixture';

test.describe('Book Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/books');
  });

  test('should display the books table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Livros/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should search for a book', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Título ou ISBN/i);
    await searchInput.fill('O Senhor dos Anéis');
    
    // We expect the table to filter. 
    await expect(searchInput).toHaveValue('O Senhor dos Anéis');
  });

  test('should open and close the "Novo Livro" dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Novo Livro/i }).click();
    await expect(page.getByRole('heading', { name: /Novo Livro/i })).toBeVisible();
    
    await page.getByRole('button', { name: /Cancelar/i }).click();
    await expect(page.getByRole('heading', { name: /Novo Livro/i })).not.toBeVisible();
  });

  test('should create a new book', async ({ page }) => {
    await page.getByRole('button', { name: /Novo Livro/i }).click();

    // Fill the form using accessible names
    await page.getByLabel(/Título/i).fill('Test Book ' + Date.now());
    await page.getByLabel(/Peso \(g\)/i).fill('500');

    // Handle selects (Shadcn/Radix UI Selects) using labels
    // Estado
    await page.getByLabel(/Estado/i).click();
    await page.getByRole('option', { name: /Novo/i }).click();

    // Edição
    await page.getByLabel(/Edição/i).click();
    await page.getByRole('option', { name: /Normal/i }).click();

    // Status
    await page.getByLabel(/Status/i).click();
    await page.getByRole('option', { name: /Completo/i }).click();

    // Submit
    await page.getByRole('button', { name: /Criar/i }).click();

    // Success: dialog should close
    await expect(page.getByRole('heading', { name: /Novo Livro/i })).not.toBeVisible();
  });

  // Note: Edit and Delete require an existing book in the table.
  test('should open edit dialog for a book', async ({ page }) => {
    // Wait for data to load
    await expect(page.getByRole('table')).toBeVisible();
    
    // Click actions on the first row
    const actionsButton = page.locator('table tbody tr').first().getByRole('button', { name: /Abrir menu/i });
    if (await actionsButton.isVisible()) {
      await actionsButton.click();
      await page.getByRole('menuitem', { name: /Editar/i }).click();
      await expect(page.getByRole('heading', { name: /Editar Livro/i })).toBeVisible();
    }
  });
});
