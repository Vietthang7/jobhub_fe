# JobHub E2E Tests

This suite uses Playwright to test the core flows of the JobHub application.

## Prerequisites

- Backend must be running and reachable.
- Environment variables must be set in `.env.local` at the root of `jobhub-web/`.

## Configuration

Copy `e2e/.env.example` values into your `.env.local`:

```env
PLAYWRIGHT_BASE_URL=http://localhost:3000
E2E_API_BASE=http://localhost:8080/api
E2E_CANDIDATE_EMAIL=<email>
E2E_CANDIDATE_PASSWORD=<password>
E2E_EMPLOYER_EMAIL=<email>
E2E_EMPLOYER_PASSWORD=<password>
E2E_ADMIN_EMAIL=<email>
E2E_ADMIN_PASSWORD=<password>
```

## Running tests

```bash
# Run all tests
npm run e2e

# Run tests in UI mode
npm run e2e:ui
```
