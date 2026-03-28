import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('/login');

  // Fill credentials
  await page.getByLabel(/Email/i).fill('admin@admin.com');
  await page.getByLabel(/Senha/i).fill('admin123');
  
  // Click login
  await page.getByRole('button', { name: /Entrar/i }).click();

  // Wait for redirect to happen (it redirects to /users as seen in unit tests)
  // Or wait for some element that shows we are logged in.
  // We'll wait for URL to not be /login anymore.
  await page.waitForURL(url => url.pathname !== '/login');
  
  // Alternatively, wait for a sidebar item or something common in dashboard
  // await expect(page.getByText(/Sebo Stock/i)).toBeVisible();

  // Save storage state
  await page.context().storageState({ path: authFile });
});
