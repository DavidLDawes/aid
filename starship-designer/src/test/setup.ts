// Test setup file for Jest
import '@testing-library/jest-dom'

// Import polyfill using ES module syntax
import { structuredClone as polyfill } from '@ungap/structured-clone';
// IMPORTANT: Polyfill structuredClone BEFORE importing fake-indexeddb
if (typeof structuredClone === 'undefined') {
  global.structuredClone = polyfill;
}

import 'fake-indexeddb/auto'

beforeEach(() => {
  // Reset any global state between tests if needed
})