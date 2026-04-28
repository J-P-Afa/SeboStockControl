import { test as setup, expect } from '../fixtures/msw.fixture';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  page.on('console', msg => console.log(`SETUP CONSOLE: [${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`SETUP PAGE ERROR: ${err.message}`));

  // Go to login page
  console.log('Navigating to /login...');
  await page.goto('/login');

  // Ensure page is loaded
  try {
    await expect(page.getByRole('heading', { name: /Sebo Alfa/i })).toBeVisible({ timeout: 15000 });
    console.log('Login page loaded successfully.');
  } catch (e) {
    console.error('FAILED to load login page in setup. URL:', page.url());
    const content = await page.content();
    console.error('Page content snippet:', content.substring(0, 1000));
    throw e;
  }

  // Fill credentials
  await page.getByLabel(/Email/i).fill('admin@admin.com');
  await page.getByLabel(/Senha/i).fill('admin123');
  
  // Click login
  await page.getByRole('button', { name: /Entrar/i }).click();

  // Wait for redirect to happen
  try {
    await page.waitForURL(url => url.pathname !== '/login', { timeout: 20000 });
  } catch (e) {
    console.error('FAILED to redirect after login in setup. Current URL:', page.url());
    const errorMessage = await page.getByRole('alert').innerText().catch(() => 'No alert found');
    console.error('Possible error on page:', errorMessage);
    throw e;
  }
  
  // Save storage state
  await page.context().storageState({ path: authFile });
});
