import '@testing-library/jest-dom';
import { server } from './src/lib/api/mocks/server';
import { beforeAll, afterEach, afterAll, expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

// Add axe matchers
expect.extend(toHaveNoViolations);

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

