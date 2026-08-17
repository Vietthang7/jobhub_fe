import { expect } from '@playwright/test';
import { test } from '../fixtures/auth';

test.describe('Employer Flow', () => {
  test('Employer jobs list renders', async ({ authedPage }) => {
    const page = await authedPage('EMPLOYER');
    await page.goto('/employer/jobs');
    await expect(page.getByRole('heading', { name: /Jobs của tôi/i }).first()).toBeVisible();
  });

  test('Create job flow', async ({ authedPage }) => {
    const page = await authedPage('EMPLOYER');

    // Login through UI so zustand store initializes via setSession()
    // (storageState-only hydration races with React SSR hydration)
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(process.env.E2E_EMPLOYER_EMAIL!);
    await page.locator('input[name="password"]').fill(process.env.E2E_EMPLOYER_PASSWORD!);
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await page.waitForURL(/\/employer\/jobs/, { timeout: 15000 });

    // Client-side nav to job creation (preserves auth state)
    await page.getByRole('link', { name: /Tạo job mới/i }).first().click();
    await page.waitForURL('/employer/jobs/new', { timeout: 10000 });

    const submitBtn = page.getByRole('button', { name: /Tạo job/i });
    await expect(submitBtn).toBeVisible({ timeout: 15000 });

    await page.getByLabel(/Tiêu đề công việc/i).fill('E2E Job ' + Date.now());
    await page.getByLabel(/Mô tả công việc/i).fill('E2E test description content');

    await expect(submitBtn).toBeEnabled();

    await Promise.all([
      page.waitForURL(/\/employer\/jobs(\?|$)/, { timeout: 15000 }),
      submitBtn.click(),
    ]);
    await expect(page).toHaveURL(/\/employer\/jobs(\?|$)/);
  });

  test('View applicants for a job', async ({ authedPage }) => {
    const page = await authedPage('EMPLOYER');
    await page.goto('/employer/jobs');
    
    const jobLinks = page.locator('a[href^="/employer/jobs/"]').filter({ hasNot: page.locator('a[href="/employer/jobs/new"]') });
    if (await jobLinks.count() === 0) test.skip(true, 'No jobs posted by this employer');
    
    await jobLinks.first().click();
    await expect(page.getByText(/Ứng viên|Applicants/i)).toBeVisible();
  });
});
