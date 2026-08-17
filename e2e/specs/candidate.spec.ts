import { expect } from '@playwright/test';
import { test } from '../fixtures/auth';

test.describe('Candidate Flow', () => {
  test('My applications page renders with heading', async ({ authedPage }) => {
    const page = await authedPage('CANDIDATE');
    await page.goto('/applications/mine');
    await expect(page.getByRole('heading', { name: /ứng tuyển của bạn/i })).toBeVisible();
  });

  test('Clicking filter tabs changes list', async ({ authedPage }) => {
    const page = await authedPage('CANDIDATE');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.goto('/applications/mine');
    
    await expect(page.getByRole('tab', { name: 'Tất cả' })).toBeVisible({ timeout: 15000 });

    const tabs = ['Tất cả', 'Đang chờ', 'Đã chấp nhận', 'Đã từ chối', 'Đã rút'];
    for (const tabName of tabs) {
      const tab = page.getByRole('tab', { name: tabName });
      if (await tab.isVisible()) {
        await tab.click();
        await expect(tab).toHaveAttribute('data-state', 'active', { timeout: 5000 });
      }
    }
  });

  test('Apply for a job', async ({ authedPage }) => {
    const page = await authedPage('CANDIDATE');
    await page.goto('/jobs');
    
    const jobLinks = page.locator('a[href^="/jobs/"]').filter({ hasNot: page.locator('a[href="/jobs/new"]') });
    if (await jobLinks.count() === 0) test.skip(true, 'No jobs to apply');
    
    await jobLinks.first().click();
    
    const applyBtn = page.getByRole('button', { name: /Ứng tuyển/i });
    if (!await applyBtn.isVisible()) test.skip(true, 'Job already applied or not accepting applications');
    
    await applyBtn.click();
    
    await expect(page.getByText(/thành công/i)).toBeVisible();
    await page.waitForURL('/applications/mine');
  });
});
