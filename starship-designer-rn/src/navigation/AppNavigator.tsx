// Main navigation structure for React Native app
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens (we'll create these next)
import SelectShipScreen from '../screens/SelectShipScreen';
import ShipDesignerTabs from './ShipDesignerTabs';

export type RootStackParamList = {
  SelectShip: undefined;
  ShipDesigner: { shipName?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="SelectShip"
        screenOptions={{
          headerStyle: { backgroundColor: '#2c3e50' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      >
        <Stack.Screen 
          name="SelectShip" 
          component={SelectShipScreen}
          options={{ title: 'Starship Designer' }}
        />
        <Stack.Screen 
          name="ShipDesigner" 
          component={ShipDesignerTabs}
          options={({ route }) => ({ 
            title: route.params?.shipName ? `Starship Designer: ${route.params.shipName}` : 'Starship Designer'
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;