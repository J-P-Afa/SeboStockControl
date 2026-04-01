import { test, expect } from './fixtures/msw.fixture';

test('debug dialog roles', async ({ page }) => {
  page.on('console', msg => {
    console.log(`PAGE CONSOLE: [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', error => {
    console.log(`PAGE CRASH: ${error.message}`);
    console.log(`STACK: ${error.stack}`);
  });

  await page.goto('/books');
  await page.waitForTimeout(2000);
  
  console.log('Clicking "Novo Livro" button...');
  await page.getByRole('button', { name: /Novo Livro/i }).click();
  
  await page.waitForTimeout(2000);
  
  // Log all headings
  const headings = await page.getByRole('heading').allInnerTexts();
  console.log('Headings found after click:', headings);
});
