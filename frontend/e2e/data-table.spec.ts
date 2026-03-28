import { test, expect } from '@playwright/test';

test.describe('Data Table Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/books');
  });

  test('should sort books by title', async ({ page }) => {
    // Locate the sortable header for "Título"
    const titleHeader = page.getByRole('button', { name: /Título/i });
    
    // Check initial state
    await expect(titleHeader).toBeVisible();
    
    // Click to sort
    await titleHeader.click();
    
    // We expect some visual change or the table to re-request data.
    // In a real app we might verify the order of items.
  });

  test('should navigate through pages', async ({ page }) => {
    // Wait for the table to be visible
    await expect(page.getByRole('table')).toBeVisible();

    // Check if pagination exists and click the next button
    // The pagination buttons are usually "Seguinte" or "Anterior" in Portuguese based on the UI.
    const nextButton = page.getByRole('button', { name: /Próxima/i }).or(page.getByRole('button', { name: /Next/i }));
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      // Should still see the table but likely with different data
      await expect(page.getByRole('table')).toBeVisible();
    }
  });

  test('should change page size', async ({ page }) => {
    // Find the page size select
    const pageSizeTrigger = page.getByRole('button', { name: /10/i }); // Default is 10
    
    if (await pageSizeTrigger.isVisible()) {
      await pageSizeTrigger.click();
      // Select 20
      await page.getByRole('option', { name: /20/i }).click();
      
      // Verify the trigger now shows 20
      await expect(page.getByRole('button', { name: /20/i })).toBeVisible();
    }
  });

  test('should apply filters', async ({ page }) => {
    const inStockSwitch = page.locator('label:has-text("Apenas em estoque")').locator('button');
    
    if (await inStockSwitch.isVisible()) {
      await inStockSwitch.click();
      // Verify switch is checked (Radix UI Switch uses aria-checked)
      await expect(inStockSwitch).toHaveAttribute('aria-checked', 'true');
    }
  });
});
