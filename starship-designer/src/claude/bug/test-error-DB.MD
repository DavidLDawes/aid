#claude instructions
Use the procedure described in src/claude/claude.MD to make changes, so this one will be the test-error bug, using the bug/test-error branch.

When npm runs tests in a CI/CD pipeline I get the following output including several errors, address them:
 src/services/applyFeature.test.ts (9 tests | 2 failed) 1549ms
   ✓ Apply Feature Script > Path validation > should reject files outside src/claude directory 176ms
   ✓ Apply Feature Script > Path validation > should reject files outside src/claude (absolute path) 199ms
   ✓ Apply Feature Script > Path validation > should accept files under src/claude directory 198ms
   ✓ Apply Feature Script > Command line argument handling > should show usage when no arguments provided 170ms
   ✓ Apply Feature Script > Command line argument handling > should show usage when too many arguments provided 199ms
   ✓ Apply Feature Script > File processing > should reject non-existent files 150ms
   ✓ Apply Feature Script > File processing > should extract instructions from valid files 148ms
   × Apply Feature Script > Integration with existing files > should successfully process npm-flush-db.MD 161ms
     → expected '\n> starship-designer@0.0.0 apply-fea…' to contain 'Path validated: process\npm-flush-db.…'
   × Apply Feature Script > Integration with existing files > should successfully process npm-apply-feature.MD 139ms
     → expected '\n> starship-designer@0.0.0 apply-fea…' to contain 'Path validated: process\npm-apply-fea…'
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  src/services/applyFeature.test.ts > Apply Feature Script > Integration with existing files > should successfully process npm-flush-db.MD
AssertionError: expected '\n> starship-designer@0.0.0 apply-fea…' to contain 'Path validated: process\npm-flush-db.…'
- Expected
+ Received
- Path validated: process\npm-flush-db.MD