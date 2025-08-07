// Test setup file for Jest
import '@testing-library/jest-dom';
// Import polyfill using ES module syntax (default import)
import structuredClonePolyfill from '@ungap/structured-clone';
// IMPORTANT: Polyfill structuredClone BEFORE importing fake-indexeddb
if (typeof structuredClone === 'undefined') {
    global.structuredClone = structuredClonePolyfill;
}
import 'fake-indexeddb/auto';
beforeEach(() => {
    // Reset any global state between tests if needed
});
