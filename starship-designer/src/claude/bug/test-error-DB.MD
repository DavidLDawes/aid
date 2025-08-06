#claude instructions
Use the procedure described in src/claude/claude.MD to make changes, so this one will be the test-error bug, using the bug/test-error branch.

When npm runs tests in a CI/CD pipeline I get the following error:
Error: src/services/flushDB.test.ts(26,25): error TS2341: Property 'db' is private and only accessible within class 'DatabaseService'.

(end of error)
Fix this issue.
