#claude instructions
Use the procedure described in src/claude/claude.MD to make changes, so this one will be the test-error bug, using the bug/test-error branch.

When npm runs tests in a CI/CD pipeline I get the following errors:

1. TypeScript compilation error:
Error: src/services/flushDB.test.ts(26,25): error TS2341: Property 'db' is private and only accessible within class 'DatabaseService'.

2. Test execution failures in applyFeature.test.ts:
   × Apply Feature Script > Integration with existing files > should successfully process npm-flush-db.MD
     → expected '\n> starship-designer@0.0.0 apply-fea…' to contain 'Path validated: process\npm-flush-db.…'
   × Apply Feature Script > Integration with existing files > should successfully process npm-apply-feature.MD
     → expected '\n> starship-designer@0.0.0 apply-fea…' to contain 'Path validated: process\npm-apply-fea…'

The test failures seem to be related to npm output formatting differences between local and CI/CD environments. The tests are looking for specific strings in the console output, but CI/CD environments may have different npm output formatting.

Take a look at figuring out why these occur, when they seem to run fine locally.
