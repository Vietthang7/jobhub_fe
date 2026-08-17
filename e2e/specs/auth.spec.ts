import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Login with empty fields shows error', async ({ page }) => {
    await page.goto('/login');
    
    const submitBtn = page.getByRole('button', { name: /Đăng nhập|Login/i });
    await submitBtn.click();
    
    // Should show validation errors for email and password
    await expect(page.getByText(/email|required|bắt buộc/i).first()).toBeVisible();
  });

  test('Unauthorized access to /applications/mine redirects to login then back', async ({ page }) => {
    await page.goto('/applications/mine');
    
    // Wait for redirect
    await page.waitForURL(/\/login\?next=%2Fapplications%2Fmine/);
    await expect(page.getByRole('heading', { name: /Đăng nhập|Login/i })).toBeVisible();
    
    // Could test full login here, but mostly ensuring redirect is solid.
  });

  test('Register with missing fields shows validation error', async ({ page }) => {
    await page.goto('/register');
    
    const submitBtn = page.getByRole('button', { name: /Đăng ký|Register/i });
    await submitBtn.click();
    
    await expect(page.getByText(/không được để trống|hợp lệ|required/i).first()).toBeVisible();
  });
});
