import { TestEnvironment } from 'jest-environment-jsdom';
import structuredClonePolyfill from '@ungap/structured-clone';

class JSDOMEnvironmentWithStructuredClone extends TestEnvironment {
  async setup() {
    await super.setup();
    
    // Ensure structuredClone is available in both global and window contexts
    if (typeof this.global.structuredClone === 'undefined') {
      this.global.structuredClone = structuredClonePolyfill;
    }
    
    if (typeof this.global.window.structuredClone === 'undefined') {
      this.global.window.structuredClone = structuredClonePolyfill;
    }
  }
}

export default JSDOMEnvironmentWithStructuredClone;