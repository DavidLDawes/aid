import { describe, it, expect } from '@jest/globals';
import { getConfigurationName } from './constants';

describe('getConfigurationName', () => {
  it('combines the configuration with its shape', () => {
    expect(getConfigurationName({ configuration: 'standard', configuration_shape: 'wedge' })).toBe('Standard Wedge');
    expect(getConfigurationName({ configuration: 'streamlined', configuration_shape: 'lifting_body' })).toBe('Streamlined Lifting Body');
  });

  it('names a distributed hull without a shape', () => {
    expect(getConfigurationName({ configuration: 'distributed' })).toBe('Distributed');
  });

  it('names a design saved before shapes existed without a shape', () => {
    expect(getConfigurationName({ configuration: 'standard' })).toBe('Standard');
  });

  it("ignores a shape that doesn't belong to the configuration", () => {
    expect(getConfigurationName({ configuration: 'streamlined', configuration_shape: 'wedge' })).toBe('Streamlined');
  });
});
