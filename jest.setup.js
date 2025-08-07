// Proper structuredClone polyfill for Node.js environments - runs BEFORE all test files
if (typeof structuredClone === 'undefined') {
  const { structuredClone: polyfill } = require('@ungap/structured-clone');
  global.structuredClone = polyfill;
}