import { expect } from '@playwright/test';
import { test } from '../fixtures/auth';

test('debug employer create full', async ({ authedPage }) => {
  const page = await authedPage('EMPLOYER');
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message, err.stack));
  page.on('crash', () => console.log('PAGE CRASHED'));
  page.on('close', () => console.log('PAGE CLOSED', new Error().stack));
  page.context().on('close', () => console.log('CONTEXT CLOSED'));

  await page.goto('/employer/jobs/new');
  await expect(page.getByRole('heading', { name: /Tạo job mới/i })).toBeVisible({ timeout: 15000 });
  console.log('Heading visible');

  const titleInput = page.getByRole('textbox', { name: /Tiêu đề công việc/i });
  await titleInput.fill('E2E Test Job ' + Date.now());
  console.log('Title filled, url:', page.url());

  const descInput = page.getByRole('textbox', { name: /Mô tả công việc/i });
  console.log('Desc count before fill:', await descInput.count());
  await descInput.fill('This is a description for E2E test job.');
  console.log('Desc filled');
});
