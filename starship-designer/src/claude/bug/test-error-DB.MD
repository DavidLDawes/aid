#claude instructions
Use the procedure described in src/claude/claude.MD to make changes, so this one will be the test-error bug, using the bug/test-error branch.

When npm runs tests in a CI/CD pipeline I get the following error:
Error: src/services/flushDB.test.ts(26,25): error TS2341: Property 'db' is private and only accessible within class 'DatabaseService'.

(end of error)
I'm not sure I can reproduce this, but take a look.

Also, now when I run the tests :npm run tests:run" I get three errors:
   × Apply Feature Script > Integration with existing files > should successfully process npm-flush-db.MD 198ms
     → expected '\n> starship-designer@0.0.0 apply-fea…' to contain 'Path validated: process\npm-flush-db.…'
   × Apply Feature Script > Integration with existing files > should successfully process npm-apply-feature.MD 183ms
     → expected '\n> starship-designer@0.0.0 apply-fea…' to contain 'Path validated: process\npm-apply-fea…'
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  src/services/applyFeature.test.ts > Apply Feature Script > Integration with existing files > should successfully process npm-flush-db.MD
AssertionError: expected '\n> starship-designer@0.0.0 apply-fea…' to contain 'Path validated: process\npm-flush-db.…'

Take a look at figuring out why these occur, when they seem to run fine locally.
