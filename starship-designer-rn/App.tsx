// Main App component for React Native Starship Designer
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ShipDesignProvider } from './src/context/ShipDesignContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ShipDesignProvider>
        <AppNavigator />
        <StatusBar style="light" backgroundColor="#2c3e50" />
      </ShipDesignProvider>
    </SafeAreaProvider>
  );
}