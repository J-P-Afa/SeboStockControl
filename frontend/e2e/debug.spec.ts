import { test, expect } from './fixtures/msw.fixture';

test('debug dialog', async ({ page }) => {
  await page.goto('/books');
  await page.getByRole('button', { name: /Novo Livro/i }).click();
  
  // Wait a bit for transition
  await page.waitForTimeout(1000);
  
  const content = await page.content();
  console.log('PAGE CONTENT:', content);
  
  const dialogContent = await page.locator('[data-slot="dialog-content"]').innerHTML().catch(() => 'NOT FOUND');
  console.log('DIALOG CONTENT:', dialogContent);

  const title = await page.locator('[data-slot="dialog-title"]').textContent().catch(() => 'NOT FOUND');
  console.log('DIALOG TITLE:', title);
});
