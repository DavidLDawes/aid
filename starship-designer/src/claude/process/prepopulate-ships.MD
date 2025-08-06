#claude instructions
Using the procedure described in src/claude/claude.MD to make changes, so this one will be the prepopulate-ships feature, using the feature/prepopulate-ships branch. Save any tests you create in the test suite.

Add a new "npm setInitialDB" command which first runs the "npm extractDB" command, then moves the stored data from the extract into a location available at npm run runtime so that the first time the app is run (so there are no ships are defined even after loading the DB) it automatically loads the data put aside from the "npm setInitialDB" command into the DB then proceeds normally. If there is no ship even after the preload step, then continue to the Load Ship dialog anyway.

# claude logs

## Initial Implementation - prepopulate-ships Feature

**Branch:** feature/prepopulate-ships  
**Date:** 2025-08-05

### Overview
Successfully implemented automatic ship prepopulation functionality that allows the app to load initial ships when starting with an empty database, following Claude usage standards.

### Changes Made

#### 1. Created npm setInitialDB Command (scripts/setInitialDB.mjs)
**Purpose**: Setup initial database with ships that can be automatically loaded on first app launch

**Functionality:**
- Runs `npm run extractDB` to export current ships from database
- Copies exported data to `public/initial-ships.json` for runtime access
- Validates that ships exist before proceeding
- Provides comprehensive console feedback about the operation

**Key Implementation Details:**
```javascript
async function setInitialDB() {
  // 1. Run extractDB to export current ships
  await execAsync('npm run extractDB');
  
  // 2. Validate export data exists and has ships
  const exportData = JSON.parse(await fs.readFile(EXPORT_FILE, 'utf8'));
  
  // 3. Copy to public directory for runtime access
  await fs.writeFile(INITIAL_DATA_FILE, JSON.stringify(exportData, null, 2), 'utf8');
}
```

#### 2. Created Initial Data Service (src/services/initialDataService.ts)
**Purpose**: Handle automatic loading of initial ship data when database is empty

**Key Methods:**
- `loadInitialDataIfNeeded()`: Checks if database is empty and loads initial ships if available
- `hasInitialData()`: Checks if initial data file exists and contains ships
- `loadInitialData()`: Private method to fetch and parse initial data file

**Core Logic:**
```typescript
async loadInitialDataIfNeeded(): Promise<boolean> {
  // 1. Check if database already has ships
  const hasShips = await databaseService.hasAnyShips();
  if (hasShips) return false;
  
  // 2. Try to load initial data from public/initial-ships.json
  const initialData = await this.loadInitialData();
  if (!initialData?.ships?.length) return false;
  
  // 3. Preload ships using saveOrUpdateShipByName
  for (const shipData of initialData.ships) {
    const { _metadata, ...shipDesign } = shipData;
    await databaseService.saveOrUpdateShipByName(shipDesign);
  }
  
  return true;
}
```

#### 3. Enhanced SelectShipPanel Component (src/components/SelectShipPanel.tsx)
**Updates:**
- Added `initialDataService` import and integration
- Added `preloading` state to track initial data loading
- Modified `loadShips()` to attempt preload when no ships found
- Updated loading UI to show "Preloading initial ships..." message

**Enhanced User Experience:**
- Seamless preloading - user sees loading message during initial ship import
- Automatic fallback to empty state if no initial data available
- No changes required to existing ship selection workflow

#### 4. Package.json Updates
Added new npm script:
```json
"setInitialDB": "node scripts/setInitialDB.mjs"
```

### Technical Implementation Details

#### Runtime Data Access Strategy
**Challenge**: Need to access ship data at runtime without bundling it into the application
**Solution**: Store initial data in `public/initial-ships.json` so it can be fetched via HTTP at runtime

**File Locations:**
- **Development Setup**: `scripts/setInitialDB.mjs` copies data to `public/initial-ships.json`
- **Runtime Access**: `initialDataService` fetches from `/initial-ships.json` (served from public directory)
- **Export Source**: Uses existing `data-dumps/ships-export.json` from extractDB command

#### Database Integration
**Uses Existing Infrastructure:**
- Leverages `databaseService.saveOrUpdateShipByName()` from save-overwrite feature
- Maintains database integrity and proper ship metadata handling
- Handles potential name conflicts through overwrite mechanism

#### Error Handling
**Comprehensive Error Management:**
- Graceful handling of missing initial data file
- Individual ship loading errors don't break entire preload process
- Console logging for debugging and user feedback
- Automatic fallback to empty database state

### User Experience Flow

1. **First App Launch**: User starts app with empty database
2. **Automatic Check**: App checks for initial data file
3. **Preload Process**: If data exists, automatically loads ships with progress indicator
4. **Normal Operation**: App continues with loaded ships available for selection
5. **Fallback**: If no initial data, proceeds to normal "No ships found" state

### Testing Results

#### Comprehensive Test Suite (src/services/initialDataService.test.ts)
Created 10 tests covering all functionality:

**loadInitialDataIfNeeded Tests:**
1. ✅ Returns false if database already has ships
2. ✅ Returns false if no initial data is available  
3. ✅ Returns false if initial data has no ships
4. ✅ Loads initial ships when database is empty and data available
5. ✅ Handles errors during ship loading gracefully
6. ✅ Handles fetch errors gracefully

**hasInitialData Tests:**
7. ✅ Returns true if initial data is available
8. ✅ Returns false if initial data is not available
9. ✅ Returns false if initial data has no ships
10. ✅ Handles fetch errors gracefully

**Test Results:**
- ✅ All 77 tests passing (up from 67)
- ✅ Complete mock coverage for database service and fetch API
- ✅ Proper error handling and edge case coverage
- ✅ Metadata removal verification during preload

#### Manual Testing Results

**setInitialDB Command Testing:**
```bash
npm run setInitialDB
```
- ✅ Successfully extracts ships from database
- ✅ Validates export data contains ships
- ✅ Creates `public/initial-ships.json` with proper format
- ✅ Provides detailed console output with ship listing
- ✅ Handles error cases (no ships, missing files)

**Test Data Used:**
- Scout (100 tons, TL A) - Fast patrol ship with engines and cargo
- Free Trader (200 tons, TL A) - Merchant vessel with larger cargo capacity

### File Structure
```
public/
  └── initial-ships.json          # Runtime accessible initial data
scripts/
  ├── setInitialDB.mjs           # Setup command for initial data
  └── testPrepopulate.mjs        # Test script for development
src/services/
  ├── initialDataService.ts      # Service for automatic preloading
  └── initialDataService.test.ts # Comprehensive test suite
src/components/
  └── SelectShipPanel.tsx        # Enhanced with preload integration
```

### Integration with Existing Features

#### Leverages Previous Work:
- **extractDB/preloadDB**: Uses extractDB output as source for initial data
- **saveOrUpdateShipByName**: Uses overwrite-capable save method from save-overwrite feature
- **Database Service**: Builds on existing database infrastructure

#### Maintains Compatibility:
- No breaking changes to existing functionality
- Preserves all existing ship selection and loading workflows
- Optional enhancement that activates only when needed

### Implementation Complete

All requirements fulfilled:
- ✅ `npm setInitialDB` command extracts and prepares initial ship data
- ✅ Automatic preloading when app starts with empty database
- ✅ Ships loaded from runtime-accessible location (`public/initial-ships.json`)
- ✅ Graceful fallback to Load Ship dialog if no initial data available
- ✅ Comprehensive test coverage with 10 new tests (77 total passing)
- ✅ Seamless user experience with loading indicators and error handling
- ✅ Full integration with existing database and UI infrastructure