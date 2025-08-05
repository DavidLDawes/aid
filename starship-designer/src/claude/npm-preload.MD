#claude instructions
Using the procedure described in src/claude/claude.MD to make changes, so this one will be the npm-preload feature, using the branch feature/npm-preload, add two npm targets, "extractDB" and "preloadDB"
Running the "npm extractDB" command will then extract out the current set of defined ships with all of their related DB values into an appropriately formatted data dump in the directory tree.
Running the "npm preloadDB" command will check for the appropriately formatted data dump as created by a prior run of the "npm extractDB" command, importing the resulting ship designs into the DB, overwriting (deleting) any existing records in the DB with the same ship name.

# claude logs

## Initial Implementation - npm-preload Feature

**Branch:** feature/npm-preload  
**Date:** 2025-08-05

### Overview
Successfully implemented npm scripts "extractDB" and "preloadDB" for database export/import operations following Claude usage standards.

### Changes Made

#### 1. Package.json Updates
Added two new npm scripts:
- `"extractDB": "node scripts/extractDB.mjs"` - Extracts ships from IndexedDB to JSON file
- `"preloadDB": "node scripts/preloadDB.mjs"` - Imports ships from JSON file to IndexedDB

#### 2. Created scripts/extractDB.mjs
**Key Features:**
- Uses fake-indexeddb for Node.js compatibility with proper import paths: `'fake-indexeddb/lib/fakeIndexedDB'` and `'fake-indexeddb/lib/FDBKeyRange'`
- Extracts all ships from IndexedDB database
- Outputs to `data-dumps/ships-export.json` with structured format:
  ```json
  {
    "exportDate": "ISO date string",
    "version": "1.0",
    "ships": [ship_array_with_metadata]
  }
  ```
- Preserves original ship metadata (id, createdAt, updatedAt) in `_metadata` field
- Handles empty database gracefully with informative messages
- Provides detailed console output showing exported ships

#### 3. Created scripts/preloadDB.mjs  
**Key Features:**
- Uses same fake-indexeddb setup as extractDB
- Validates export file existence and format before processing
- Implements ship overwrite functionality by name:
  - Checks for existing ship with same name
  - Deletes existing ship before adding updated version
  - Tracks imported vs updated ship counts
- Comprehensive error handling with detailed error messages
- Import summary showing:
  - New ships imported
  - Existing ships updated  
  - Error count
  - Total processed

#### 4. Database Integration
Both scripts implement a `NodeDatabaseService` class that:
- Mirrors the main application's database schema (version 2)
- Handles database initialization with proper indexes
- Provides methods for ship CRUD operations
- Uses promises for async database operations

### Technical Challenges Resolved

#### fake-indexeddb Import Issues
Overcame multiple import path issues with fake-indexeddb:
- Initial attempts with `'fake-indexeddb/lib/FDBFactory.js'` failed
- Second attempts with `'fake-indexeddb/FDBKeyRange.js'` failed  
- Final successful imports: `'fake-indexeddb/lib/fakeIndexedDB'` and `'fake-indexeddb/lib/FDBKeyRange'`

### Testing Results

#### extractDB Testing
- ✅ Handles empty database gracefully (reports "No ships found")
- ✅ Extracts test ships with complete ship design data
- ✅ Creates proper JSON format with metadata preservation
- ✅ Output file created at `data-dumps/ships-export.json`

#### preloadDB Testing  
- ✅ Validates export file existence (fails gracefully when missing)
- ✅ Imports ships from JSON export successfully
- ✅ Handles ship overwriting correctly (deletes existing, adds updated)
- ✅ Provides detailed import summary
- ✅ Preserves ship design data integrity during import

#### Test Data Used
Created test data with two ships:
- "Test Scout" (100 tons, TL A) - Basic scout configuration
- "Test Trader" (200 tons, TL A) - Trading vessel with cargo space

Both scripts successfully:
- Read/write the `data-dumps/ships-export.json` file
- Handle ship designs with engines, fittings, berths, cargo, etc.
- Maintain data integrity throughout export/import cycle

### File Structure
```
data-dumps/
  ├── ships-export.json          # Export data file
scripts/
  ├── extractDB.mjs             # Database extraction script  
  ├── preloadDB.mjs             # Database preloading script
  └── testAddStandardShips.mjs  # Test data creation script
```

### Implementation Complete
All requirements fulfilled:
- ✅ npm extractDB command extracts ships to formatted data dump
- ✅ npm preloadDB command imports from data dump with overwrite capability
- ✅ Both commands handle error cases gracefully  
- ✅ Comprehensive testing completed successfully
- ✅ Full integration with fake-indexeddb for Node.js compatibility

### Final Status
Feature implementation complete. Claude is now preparing the PR for application by pushing final branch changes and removing draft status.
