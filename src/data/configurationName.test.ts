import { describe, it, expect } from '@jest/globals';
import { getConfigurationName, getConfigurationShape, getWedgeFloorLengthRatio } from './constants';

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

describe('getWedgeFloorLengthRatio', () => {
  const profile = (floorCount: number) =>
    Array.from({ length: floorCount }, (_, floor) => getWedgeFloorLengthRatio(floor, floorCount));

  it('makes the top and bottom floors 75% of the middle floor', () => {
    const floors = profile(3);
    expect(floors[0]).toBeCloseTo(0.75);
    expect(floors[1]).toBeCloseTo(1);
    expect(floors[2]).toBeCloseTo(0.75);
  });

  it('interpolates the floors in between linearly', () => {
    [0.75, 0.875, 1, 0.875, 0.75].forEach((ratio, floor) => {
      expect(profile(5)[floor]).toBeCloseTo(ratio);
    });
  });

  it('keeps a linear taper when the middle falls between two floors', () => {
    [0.75, 11 / 12, 11 / 12, 0.75].forEach((ratio, floor) => {
      expect(profile(4)[floor]).toBeCloseTo(ratio);
    });
  });

  it('leaves a single floor at full length', () => {
    expect(getWedgeFloorLengthRatio(0, 1)).toBe(1);
  });
});
