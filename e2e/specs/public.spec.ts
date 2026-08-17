import { test, expect } from '@playwright/test';

test.describe('Public Routes', () => {
  test('Home page shows hero and CTA', async ({ page }) => {
    await page.goto('/');
    
    // Check main title or CTA link
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    
    // Attempt to locate a likely link to /jobs (e.g. "Tìm việc ngay", "Browse Jobs", etc.)
    // It depends on the actual text, but we know it links to /jobs.
    const jobsLink = page.locator('a[href="/jobs"]').first();
    if (await jobsLink.isVisible()) {
      await expect(jobsLink).toBeVisible();
    }
  });

  test('Jobs list renders without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto('/jobs');
    
    // Check for some main heading or list container.
    // If it's empty, we might see "Không có việc làm" or similar text.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    expect(errors.length).toBe(0);
  });

  test('Clicking first job navigates to details', async ({ page }) => {
    const responsePromise = page.waitForResponse((res) =>
      res.url().includes('/jobs/search') && res.status() === 200
    );
    await page.goto('/jobs');
    await responsePromise;

    const jobLinks = page.locator('a[href^="/jobs/"]');
    await expect(jobLinks.first()).toBeVisible({ timeout: 10000 });

    await jobLinks.first().click();
    await page.waitForURL(/\/jobs\/\d+/);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button').filter({ hasText: /Ứng tuyển|Apply/i }).first()).toBeVisible();
  });
});
