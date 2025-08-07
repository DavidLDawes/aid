const { TestEnvironment } = require('jest-environment-jsdom');

class JSDOMEnvironmentWithStructuredClone extends TestEnvironment {
  async setup() {
    await super.setup();
    
    // Ensure structuredClone is available in both global and window contexts
    if (typeof this.global.structuredClone === 'undefined') {
      const { structuredClone: polyfill } = require('@ungap/structured-clone');
      this.global.structuredClone = polyfill;
    }
    
    if (typeof this.global.window.structuredClone === 'undefined') {
      const { structuredClone: polyfill } = require('@ungap/structured-clone');
      this.global.window.structuredClone = polyfill;
    }
  }
}

module.exports = JSDOMEnvironmentWithStructuredClone;