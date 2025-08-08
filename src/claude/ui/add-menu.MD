#claude instructions

Using the procedure described in src/claude/claude.MD to make changes, so this one will be the add0menu feature, using the branch feature/add-menu, add a File menu with the following items in it:
1. Save - same as the Save button on the last tab (Ship Details), this writes the data out to the DB.
2. Save As - almost the same as Save, but you specify a different name for the Ship to be saved with.
3. Print - same as the <Alt>P (I think?) keys on the final screen, or maybe every screen? Bring up the print dialog with the table voiew of the ship. With this it will be available on every screen, anyway.

# claude logs

## 2025-08-08 File Menu Implementation

Successfully implemented a File menu with all requested functionality:

### Features Implemented:
1. **FileMenu Component** (`src/components/FileMenu.tsx`):
   - Dropdown menu with Save, Save As, and Print options
   - Keyboard shortcut indicators (Ctrl+S, Ctrl+Shift+S, Ctrl+P)
   - Modern UI with animations and accessibility features
   - Save As dialog with input validation
   - Toast notifications for save operations

2. **Menu Items**:
   - **Save**: Saves current ship design to database (same as Ship Details tab)
   - **Save As**: Prompts for new ship name and saves with that name
   - **Print**: Opens print dialog with ship table view (available on all screens)

3. **Global Keyboard Shortcuts**:
   - Ctrl+S: Save current design
   - Ctrl+Shift+S: Save As (prompt for new name)
   - Ctrl+P: Print current design
   - Shortcuts work on all panels except Ship Select

4. **Integration**:
   - Added FileMenu to app header (only visible when not in Ship Select mode)
   - Updated App.css with header-top layout for menu positioning
   - Uses existing database service and functionality from SummaryPanel

### Files Modified:
- `src/App.tsx`: Added FileMenu integration, keyboard shortcuts, and file operations
- `src/App.css`: Updated header layout for menu positioning
- `src/components/FileMenu.tsx`: New component with dropdown menu functionality
- `src/components/FileMenu.css`: Styling for menu component with animations

### Technical Implementation:
- Used React hooks (useState, useEffect, useCallback) for state management
- Proper TypeScript typing for all props and interfaces
- Accessibility features (ARIA attributes, keyboard navigation)
- Click outside to close menu functionality
- Proper error handling and user feedback
- Memoized callbacks to prevent unnecessary re-renders

### Testing:
- Build successful with TypeScript compilation
- All functionality tested and working as expected
- Menu appears on all panels except Ship Select
- Keyboard shortcuts work correctly and don't interfere with form inputs
- Print functionality generates appropriate content for the current ship design

The File menu is now available on every screen (except Ship Select) and provides easy access to Save, Save As, and Print functionality as requested. 

#claude code next 1
Move the menu button to the left side, before the Starship Designer title

## 2025-08-08 File Menu Position Update

Successfully moved the File menu button to the left side of the Starship Designer title as requested.

### Changes Made:

1. **App.tsx Layout Update**:
   - Moved FileMenu component before the `<h1>` title in the header-top div
   - FileMenu now appears on the left side, title in the center/right

2. **CSS Layout Improvements** (`src/App.css`):
   - Updated `.header-top` flexbox layout:
     - Removed `justify-content: space-between` 
     - Added `gap: 1rem` for proper spacing between menu and title
   - Updated `.app-header h1`:
     - Added `text-align: center` to center the title text
     - Kept `flex: 1` to allow title to take remaining space

### Layout Result:
- File menu button now appears on the far left
- Starship Designer title is centered in the remaining space
- Maintains proper visual hierarchy and spacing
- Menu dropdown still functions correctly from left position

### Testing:
- Build successful with TypeScript compilation
- Layout tested and working as expected
- Menu functionality remains intact in new position
- Responsive design maintained

The File menu button is now positioned on the left side before the Starship Designer title, providing better visual balance and following typical menu placement conventions.
