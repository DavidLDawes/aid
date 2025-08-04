// Test for ShipDesignContext default initialization
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ShipDesignProvider, useShipDesign } from '../src/context/ShipDesignContext';

const TestComponent: React.FC = () => {
  const { shipDesign } = useShipDesign();
  
  return (
    <Text testID="engines-count">{shipDesign.engines.length}</Text>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ShipDesignProvider>
    {children}
  </ShipDesignProvider>
);

describe('ShipDesignContext', () => {
  test('should initialize with default engines', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const enginesCount = getByTestId('engines-count');
    expect(enginesCount.props.children).toBe(3); // Should have 3 engines: power plant, jump drive, maneuver drive
  });

  test('should have correct engine types in default initialization', () => {
    let capturedShipDesign: any = null;
    
    const CaptureComponent: React.FC = () => {
      const { shipDesign } = useShipDesign();
      capturedShipDesign = shipDesign;
      return <Text>Test</Text>;
    };

    render(
      <TestWrapper>
        <CaptureComponent />
      </TestWrapper>
    );

    expect(capturedShipDesign).not.toBeNull();
    expect(capturedShipDesign.engines).toHaveLength(3);
    
    const engineTypes = capturedShipDesign.engines.map((e: any) => e.engine_type);
    expect(engineTypes).toContain('power_plant');
    expect(engineTypes).toContain('jump');
    expect(engineTypes).toContain('maneuver');
    
    // All should have performance 1
    capturedShipDesign.engines.forEach((engine: any) => {
      expect(engine.performance).toBe(1);
    });
  });
});