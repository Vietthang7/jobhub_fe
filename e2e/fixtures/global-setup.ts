import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0]?.use || {};
  const apiBase = process.env.E2E_API_BASE ?? 'http://localhost:8080/api';
  
  const roles = ['CANDIDATE', 'EMPLOYER', 'ADMIN'];
  const authDir = path.join(__dirname, '../.auth');
  
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const browser = await chromium.launch();
  
  for (const role of roles) {
    const email = process.env[`E2E_${role}_EMAIL`];
    const password = process.env[`E2E_${role}_PASSWORD`];
    
    if (!email || !password) {
      console.warn(`[WARN] Missing credentials for ${role}. Tests requiring this role will be skipped.`);
      continue;
    }
    
    const page = await browser.newPage({ baseURL });
    try {
      const response = await page.request.post(`${apiBase}/auth/login`, {
        data: { email, password },
      });
      
      if (!response.ok()) {
        console.warn(`[WARN] Login failed for ${role}: ${response.status()}`);
        continue;
      }
      
      const resData = await response.json();
      
      // Inject to localStorage
      await page.goto('/');
      await page.evaluate((data) => {
        const persisted = {
          state: {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            user: {
              id: data.userId,
              email: data.email,
              roles: data.roles,
            },
          },
          version: 0,
        };
        localStorage.setItem('jobhub:auth', JSON.stringify(persisted));
      }, resData);
      
      const url = new URL(baseURL || 'http://localhost:3000');
      await page.context().addCookies([{
        name: 'jobhub_authed',
        value: '1',
        domain: url.hostname,
        path: '/',
      }]);
      
      await page.context().storageState({ path: path.join(authDir, `${role}.json`) });
      console.log(`[INFO] Authenticated ${role} successfully.`);
    } catch (e) {
      console.warn(`[WARN] Error logging in ${role}:`, e);
    } finally {
      await page.close();
    }
  }
  await browser.close();
}

export default globalSetup;
