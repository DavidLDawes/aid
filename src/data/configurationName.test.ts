import { describe, it, expect } from '@jest/globals';
import { getConfigurationName, getConfigurationShape } from './constants';
import { migrateLegacyConfiguration, createDefaultShip } from '../utils/shipDefaults';

describe('getConfigurationName', () => {
  it('combines the configuration with its shape', () => {
    expect(getConfigurationName({ configuration: 'standard', configuration_shape: 'wedge' })).toBe('Standard Wedge');
    expect(getConfigurationName({ configuration: 'streamlined', configuration_shape: 'lifting_body' })).toBe('Streamlined Lifting Body');
  });

  it('names a distributed hull without a shape', () => {
    expect(getConfigurationName({ configuration: 'distributed' })).toBe('Distributed');
  });

  it('uses the default shape for a design saved before shapes existed', () => {
    expect(getConfigurationName({ configuration: 'standard' })).toBe('Standard Wedge');
    expect(getConfigurationName({ configuration: 'streamlined' })).toBe('Streamlined Lifting Body');
  });

  it("falls back to the default for a shape that doesn't belong to the configuration", () => {
    expect(getConfigurationName({ configuration: 'streamlined', configuration_shape: 'wedge' })).toBe('Streamlined Lifting Body');
    expect(getConfigurationName({ configuration: 'distributed', configuration_shape: 'wedge' })).toBe('Distributed');
  });
});

describe('getConfigurationShape', () => {
  it('keeps a shape the design chose', () => {
    expect(getConfigurationShape({ configuration: 'standard', configuration_shape: 'cone' })).toBe('cone');
  });

  it('defaults standard to wedge, streamlined to lifting body and distributed to none', () => {
    expect(getConfigurationShape({ configuration: 'standard' })).toBe('wedge');
    expect(getConfigurationShape({ configuration: 'streamlined' })).toBe('lifting_body');
    expect(getConfigurationShape({ configuration: 'distributed' })).toBeUndefined();
  });
});

describe('migrateLegacyConfiguration', () => {
  const base = createDefaultShip('Test', 'A', 1_000_000, 'standard');

  it('treats a design saved before the selector existed as distributed', () => {
    const migrated = migrateLegacyConfiguration({ ...base, configuration_shape: undefined });
    expect(migrated.configuration).toBe('distributed');
  });

  it('keeps a configuration the user chose', () => {
    const ship = { ...base, configuration: 'streamlined' as const, configuration_shape: 'disk' as const };
    expect(migrateLegacyConfiguration(ship)).toEqual(ship);
  });
});
