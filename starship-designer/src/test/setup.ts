// Test setup file for Jest
import '@testing-library/jest-dom'

// IMPORTANT: Polyfill structuredClone BEFORE importing fake-indexeddb
if (typeof structuredClone === 'undefined') {
  const { structuredClone: polyfill } = require('@ungap/structured-clone');
  global.structuredClone = polyfill;
}

import 'fake-indexeddb/auto'

beforeEach(() => {
  // Reset any global state between tests if needed
})