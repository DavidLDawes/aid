// Test setup file for Jest
import '@testing-library/jest-dom'

// Import polyfill using ES module syntax (default import)
import structuredClonePolyfill from '@ungap/structured-clone';
// IMPORTANT: Polyfill structuredClone BEFORE importing fake-indexeddb
if (typeof structuredClone === 'undefined') {
  global.structuredClone = structuredClonePolyfill as typeof structuredClone;
}

import 'fake-indexeddb/auto'

// Suppress INFO logs in tests to keep output readable; ERROR stays visible
beforeAll(() => {
  jest.spyOn(console, 'info').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  // Reset any global state between tests if needed
})