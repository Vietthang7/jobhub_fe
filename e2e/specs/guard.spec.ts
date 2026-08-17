import { test, expect } from '@playwright/test';
import { test as authedTest } from '../fixtures/auth';

test.describe('Route Guards', () => {
  test('Unauth /employer/jobs redirects to login with next param', async ({ page }) => {
    await page.goto('/employer/jobs');
    await page.waitForURL(/\/login\?next=%2Femployer%2Fjobs/);
    await expect(page).toHaveURL(/\/login\?next=%2Femployer%2Fjobs/);
  });

  authedTest('CANDIDATE cannot access /employer/jobs', async ({ authedPage, page }) => {
    const candidatePage = await authedPage('CANDIDATE');
    await candidatePage.goto('/employer/jobs');
    await candidatePage.waitForURL('/');
    await expect(candidatePage.getByText(/không có quyền|forbidden|permission/i)).toBeVisible();
  });

  authedTest('CANDIDATE cannot access /admin', async ({ authedPage }) => {
    const candidatePage = await authedPage('CANDIDATE');
    await candidatePage.goto('/admin');
    await candidatePage.waitForURL('/');
    await expect(candidatePage.getByText(/không có quyền|forbidden|permission/i)).toBeVisible();
  });

  authedTest('EMPLOYER cannot access /admin/users', async ({ authedPage }) => {
    const employerPage = await authedPage('EMPLOYER');
    await employerPage.goto('/admin/users');
    await employerPage.waitForURL('/');
    await expect(employerPage.getByText(/không có quyền|forbidden|permission/i)).toBeVisible();
  });
});
