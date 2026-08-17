import { test, expect } from '@playwright/test';

test.describe('Core UX Invariants', () => {
  const routes = ['/', '/jobs', '/login', '/register'];
  
  for (const route of routes) {
    test(`No console errors on ${route}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', err => errors.push(err.message));
      
      await page.goto(route);
      // Wait a bit for hydration/async effects
      await page.waitForLoadState('networkidle');
      
      expect(errors.filter(e => !e.includes('Download the React DevTools'))).toHaveLength(0);
    });
  }

  test('Non-existent route shows 404', async ({ page }) => {
    await page.goto('/nonexistent-route-123-xyz');
    await expect(page.getByText(/404|không tìm thấy/i)).toBeVisible();
  });
});
