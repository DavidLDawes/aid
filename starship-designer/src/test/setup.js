// Test setup file for Jest
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
// Polyfill for structuredClone for Node.js environments
if (typeof structuredClone === 'undefined') {
    global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
beforeEach(() => {
    // Reset any global state between tests if needed
});
