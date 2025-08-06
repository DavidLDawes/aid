#claude instructions
Using the procedure described in src/claude/claude.MD to make changes, so this one will be the npm-fluch-db feature, using the branch feature/npm-flsuh-db, add one npm target, "flushDB"
Running the "npm run flushDB" command will then flsuh all entries out of the current Ships database, leaving it empty. Testing this will be simple using the "npm run extractDB" and "npm run reloadDB" commands to backup data (extractDB) before using the "npm run flushDB" command to test it & ensuring all ships are deleted, then using "npm rnu restoreDB" to restore the prior data after the test. Also add a test for startoing with no shipsd, it should already trigger the auto-load of the public/initial-ships.json file if you start with no ships defined at all.

# claude logs

## 2025-08-06 - NPM FlushDB Feature Implementation

**Feature Overview:**
Added npm script target "flushDB" to completely empty the Ships database, with support for backup/restore workflow and testing of auto-load functionality.

**Implementation Details:**

### 1. Added flushDB npm script
- **File:** `package.json`
- **Added:** `"flushDB": "node scripts/flushDB.mjs"`
- **Purpose:** Provides clean command interface to flush all ships from database

### 2. Created flushDB.mjs script
- **File:** `scripts/flushDB.mjs` 
- **Functionality:**
  - Initializes database connection using same logic as other scripts
  - Lists all ships before deletion for confirmation
  - Uses `store.clear()` to remove all entries from ships object store
  - Provides detailed console output with ship count and names
  - Verifies database is empty after flush operation
  - Handles empty database case gracefully

**Key features:**
- Lists ships before deletion: Shows ship names, tonnage, and tech level
- Confirms successful flush with verification step
- Handles both populated and empty database scenarios
- Uses same database schema and connection logic as existing scripts

### 3. Database backup/restore workflow
The existing scripts provide the complete backup/restore workflow:
- **Backup:** `npm run extractDB` → exports to `data-dumps/ships-export.json`
- **Flush:** `npm run flushDB` → empties database completely  
- **Restore:** `npm run preloadDB` → loads from `data-dumps/ships-export.json`

**Workflow Example:**
```bash
npm run extractDB    # Backup current ships
npm run flushDB      # Empty database  
npm run preloadDB    # Restore from backup
```

### 4. Auto-load testing
- **File:** `src/services/flushDB.test.ts`
- **Added 6 comprehensive tests:**

**Database flush tests:**
- Flush populated database (verifies all ships removed)
- Flush empty database (handles gracefully without errors)

**Auto-load functionality tests:**
- Auto-load when database empty (tests `loadInitialDataIfNeeded()`)
- Skip auto-load when ships exist (verifies conditional logic)
- `hasAnyShips()` method validation (empty and populated states)

**Database helper tests:**
- Validates `hasAnyShips()` returns correct boolean values

### 5. Test Results
- **Total tests:** 91 passed (up from 85)
- **New test file:** Added 6 tests for flush and auto-load functionality
- **All existing tests:** Continue to pass
- **Build status:** ✅ Successful

### 6. Files Modified/Created

**Modified:**
- `package.json` - Added flushDB npm script

**Created:**
- `scripts/flushDB.mjs` - Main flush script (173 lines)
- `src/services/flushDB.test.ts` - Comprehensive test suite (140 lines)

### 7. Technical Implementation

**FlushDB Script Structure:**
```javascript
class NodeDatabaseService {
  async flushAllShips() {
    const transaction = this.db.transaction(['ships'], 'readwrite');
    const store = transaction.objectStore('ships');
    const request = store.clear(); // Complete database flush
    // ... error handling and verification
  }
}
```

**Console Output Example:**
```
🧹 Starting database flush...
✅ Database initialized
📦 Found 2 ships in database
🗂️  Ships to be deleted:
   1. Scout (100 tons, TLE)
   2. Free Trader (200 tons, TLB)
🗑️  All ships deleted from database
✅ Database flush complete! Ships remaining: 0
🎉 Database successfully flushed!
```

### 8. Auto-load Verification
The existing auto-load functionality works correctly:
- When database is empty, `initialDataService.loadInitialDataIfNeeded()` triggers
- Loads ships from `public/initial-ships.json` automatically
- Provides seamless first-run experience for users
- Tested through comprehensive test suite

### 9. Integration with Existing Scripts
FlushDB integrates perfectly with existing database management scripts:
- Uses same fake-indexeddb setup for Node.js compatibility
- Same database schema and version handling
- Consistent error handling and console output style
- Compatible with extractDB → flushDB → preloadDB workflow

**Verification Commands:**
```bash
npm run flushDB      # ✅ Empties database
npm run extractDB    # ✅ Works with empty database
npm run preloadDB    # ✅ Restores from backup
npm run test:run     # ✅ All 91 tests pass
```

**Bug Status:** ✅ **COMPLETE** - FlushDB feature fully implemented with comprehensive testing and seamless integration with existing database management workflow.

---

**Final Status:** Claude is now getting the PR ready to apply. All development work is complete and tested.
