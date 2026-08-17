import { test as base, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export type Role = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';

type AuthedPageFn = (role: Role) => Promise<Page>;

export const test = base.extend<{ authedPage: AuthedPageFn }>({
  authedPage: async ({ browser }, use, testInfo) => {
    const opened: Page[] = [];

    const getAuthedPage: AuthedPageFn = async (role) => {
      const statePath = path.resolve(__dirname, `../.auth/${role}.json`);
      const email = process.env[`E2E_${role}_EMAIL`];
      const password = process.env[`E2E_${role}_PASSWORD`];

      if (!email || !password || !fs.existsSync(statePath)) {
        testInfo.skip(true, `missing E2E_${role}_EMAIL/PASSWORD creds or cached auth state`);
      }

      const context = await browser.newContext({ storageState: statePath });
      const page = await context.newPage();
      opened.push(page);
      return page;
    };

    await use(getAuthedPage);

    for (const page of opened) {
      await page.context().close();
    }
  },
});

export { expect } from '@playwright/test';
