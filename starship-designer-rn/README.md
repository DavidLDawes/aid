# Starship Designer React Native

A mobile version of the Starship Designer application, ported from React web to React Native using Expo.

## Project Status

✅ **Core Foundation Complete**
- Project structure set up with Expo
- TypeScript types and interfaces ported
- Constants and calculation functions ported
- Navigation structure implemented
- Storage service ported to AsyncStorage
- Context-based state management
- Basic screens implemented

## Features Implemented

### 🚀 **Core Architecture**
- **Expo React Native** setup with TypeScript
- **React Navigation** with bottom tabs and stack navigation
- **Context API** for global ship design state management
- **AsyncStorage** for local data persistence
- **Vector Icons** for navigation and UI elements

### 📱 **Screens & Navigation**
- **Select Ship Screen**: Load existing ships or create new ones
- **Ship Screen**: Basic ship information input (name, tech level, hull size, etc.)
- **Tab Navigation**: 12 tabs for different ship configuration aspects
- **Responsive Design**: Mobile-optimized layouts and touch interactions

### 💾 **Data Management**
- **Ship Design Context**: Centralized state management
- **AsyncStorage Service**: Replaces IndexedDB for mobile storage
- **Ship Persistence**: Save, load, and delete ship designs
- **Name Conflict Detection**: Real-time validation

### 🎯 **Ship Design Features**
- **Complete Type System**: All ship design interfaces ported
- **Calculation Engine**: Mass, cost, and staff requirement calculations
- **Traveller SRD Rules**: Engineering staff calculations with new tonnage-based rules
- **Component Types**: Engines, fittings, weapons, defenses, berths, facilities, cargo, vehicles, drones

## Project Structure

```
starship-designer-rn/
├── App.tsx                          # Main app component
├── src/
│   ├── types/
│   │   └── ship.ts                  # TypeScript interfaces
│   ├── data/
│   │   └── constants.ts             # Game constants and calculations
│   ├── services/
│   │   └── storage.ts               # AsyncStorage service
│   ├── context/
│   │   └── ShipDesignContext.tsx    # Global state management
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Stack navigation
│   │   └── ShipDesignerTabs.tsx     # Tab navigation
│   └── screens/
│       ├── SelectShipScreen.tsx     # Ship selection/creation
│       ├── ShipScreen.tsx           # Basic ship info
│       ├── EnginesScreen.tsx        # Engine configuration
│       └── index.ts                 # Placeholder screens
└── package.json                     # Dependencies
```

## Key Technologies

- **React Native 0.72** with Expo 49
- **TypeScript** for type safety
- **React Navigation 6** for navigation
- **AsyncStorage** for data persistence
- **React Context** for state management
- **Vector Icons** for UI elements

## Installation & Setup

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

## Implementation Status

### ✅ **Completed Core Features**
1. **Core Screen Implementation**: Engines, Fittings, Weapons, and Ship Design summary screens
2. **Mobile-Optimized Forms**: Touch-friendly form components with React Native Picker
3. **Real-time Calculations**: Mass, cost, and staff requirement calculations
4. **Data Persistence**: Complete AsyncStorage integration for save/load functionality
5. **Navigation**: Full tab and stack navigation with proper TypeScript types
6. **Export Functionality**: Native sharing for ship design export

### 🔧 **Remaining Implementation Tasks**
1. **Complete Remaining Screens**: Defenses, Berths, Rec/Health, Cargo, Vehicles, Drones, Staff
2. **Enhanced Form Validation**: Input validation and error handling
3. **UI Polish**: Animations, loading states, and improved styling

### 📊 **Advanced Features**
1. **Export Functionality**: Share ship designs via native sharing
2. **Print Alternative**: Generate PDF or formatted text for sharing
3. **Search & Filtering**: Find ships by name, tonnage, or configuration
4. **Design Templates**: Pre-built ship configurations

### 🎨 **UI/UX Enhancements**
1. **Component Libraries**: Implement consistent design system
2. **Animations**: Add smooth transitions and micro-interactions
3. **Dark Mode**: Support for system dark mode
4. **Accessibility**: Screen reader support and accessibility features

### 🔒 **Data & Security**
1. **Data Migration**: Import/export between web and mobile versions
2. **Cloud Sync**: Optional cloud storage integration
3. **Backup/Restore**: Local backup functionality

## Mobile-Specific Considerations

### **Replaced Web Features**
- **IndexedDB** → **AsyncStorage**: Mobile-friendly local storage
- **CSS Styles** → **StyleSheet**: React Native styling system
- **HTML Tables** → **FlatList/Custom**: Mobile-optimized data display
- **Ctrl+P Printing** → **Native Sharing**: Platform-appropriate export
- **Modal Dialogs** → **React Native Modal**: Native modal components

### **Mobile Optimizations**
- **Touch-First UI**: Large touch targets and gesture support
- **Responsive Layouts**: Adaptive to different screen sizes
- **Performance**: Optimized rendering and state management
- **Platform Integration**: Native look and feel

## Contributing

The foundation is complete and ready for expansion. Key areas for contribution:

1. **Screen Implementation**: Complete the remaining panel screens
2. **Component Library**: Build reusable UI components
3. **Testing**: Add unit and integration tests
4. **Documentation**: Expand user and developer documentation

## License

Based on the Traveller SRD Spacecraft Design rules. This is a fan-made tool for the Traveller RPG community.

---

**Status**: Core functionality complete with working ship design, engine configuration, fittings management, weapons selection, and comprehensive ship design summary with export capabilities. Ready for expansion with remaining component screens.