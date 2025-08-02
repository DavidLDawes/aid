// Tab navigation for ship design panels
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import ShipScreen from '../screens/ShipScreen';
import EnginesScreen from '../screens/EnginesScreen';
import FittingsScreen from '../screens/FittingsScreen';
import WeaponsScreen from '../screens/WeaponsScreen';
import ShipDesignScreen from '../screens/ShipDesignScreen';
import {
  DefensesScreen,
  RecHealthScreen,
  CargoScreen,
  VehiclesScreen,
  DronesScreen,
  BerthsScreen,
  StaffScreen
} from '../screens/PlaceholderScreens';

export type TabParamList = {
  Ship: undefined;
  Engines: undefined;
  Fittings: undefined;
  Weapons: undefined;
  Defenses: undefined;
  'Rec/Health': undefined;
  Cargo: undefined;
  Vehicles: undefined;
  Drones: undefined;
  Berths: undefined;
  Staff: undefined;
  'Ship Design': undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const ShipDesignerTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Ship':
              iconName = 'sailing';
              break;
            case 'Engines':
              iconName = 'settings';
              break;
            case 'Fittings':
              iconName = 'build';
              break;
            case 'Weapons':
              iconName = 'gps-fixed';
              break;
            case 'Defenses':
              iconName = 'security';
              break;
            case 'Rec/Health':
              iconName = 'local-hospital';
              break;
            case 'Cargo':
              iconName = 'inventory';
              break;
            case 'Vehicles':
              iconName = 'directions-car';
              break;
            case 'Drones':
              iconName = 'flight';
              break;
            case 'Berths':
              iconName = 'bed';
              break;
            case 'Staff':
              iconName = 'people';
              break;
            case 'Ship Design':
              iconName = 'description';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: '#ecf0f1',
          paddingBottom: 5,
          height: 60
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600'
        },
        headerShown: false,
        tabBarScrollEnabled: true,
        tabBarItemStyle: {
          width: 80
        }
      })}
    >
      <Tab.Screen name="Ship" component={ShipScreen} />
      <Tab.Screen name="Engines" component={EnginesScreen} />
      <Tab.Screen name="Fittings" component={FittingsScreen} />
      <Tab.Screen name="Weapons" component={WeaponsScreen} />
      <Tab.Screen name="Defenses" component={DefensesScreen} />
      <Tab.Screen name="Rec/Health" component={RecHealthScreen} />
      <Tab.Screen name="Cargo" component={CargoScreen} />
      <Tab.Screen name="Vehicles" component={VehiclesScreen} />
      <Tab.Screen name="Drones" component={DronesScreen} />
      <Tab.Screen name="Berths" component={BerthsScreen} />
      <Tab.Screen name="Staff" component={StaffScreen} />
      <Tab.Screen name="Ship Design" component={ShipDesignScreen} />
    </Tab.Navigator>
  );
};

export default ShipDesignerTabs;