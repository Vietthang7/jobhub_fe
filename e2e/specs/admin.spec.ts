import { expect } from '@playwright/test';
import { test } from '../fixtures/auth';

test.describe('Admin Flow', () => {
  test('Admin dashboard shows stats', async ({ authedPage }) => {
    const page = await authedPage('ADMIN');
    await page.goto('/admin');
    await expect(page.getByText(/Người dùng|Tổng quan hệ thống/i).first()).toBeVisible();
  });

  test('Admin users table with pagination', async ({ authedPage }) => {
    const page = await authedPage('ADMIN');
    await page.goto('/admin/users');
    

    await expect(page.locator('table, [role="grid"]').first()).toBeVisible();
    
    const paginationContainer = page.locator('div.flex.items-center.justify-center.space-x-2');
    if (await paginationContainer.isVisible()) {
      const buttons = paginationContainer.locator('button');
      const nextBtn = buttons.last();
      if (await nextBtn.isEnabled()) {
        const firstRowBefore = await page.locator('tbody tr').first().textContent();
        await nextBtn.click();
        await page.waitForLoadState('networkidle');
        const firstRowAfter = await page.locator('tbody tr').first().textContent();
        expect(firstRowAfter).not.toBe(firstRowBefore);
      }
    }
  });

  test('Admin audit logs table headers', async ({ authedPage }) => {
    const page = await authedPage('ADMIN');
    await page.goto('/admin/audit-logs');
    
    const headers = ['Hành động', 'Actor', 'Đối tượng', 'Thời gian'];
    for (const h of headers) {
      // Allow lowercase/uppercase check
      await expect(page.locator('th').filter({ hasText: new RegExp(h, 'i') }).first()).toBeVisible();
    }
  });
});
