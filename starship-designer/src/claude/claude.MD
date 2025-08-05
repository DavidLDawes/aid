\# Claude usage standards

Each claude update cycle starts with creating a feature-name.MD file.

1. The feature-name should describe the work, like engine\_mass\_constraints.MD
2. The first required section is an MD header "#claude instructions" followed by the text of the instructions to claude. Instructions end at the next "#" header line, or explicitly with an End of claude instructions" line, or finally at the end of the file is neither of the above apply.
3. Once the instructions are ready in the feature.MD file, claude is invoked; before doing further work, the git branch is switched to a new "/feature/feature-name-you-provided-in-the-MD-filename" value
4. Now claude to reads the claude instructions section and begins acting, following the instructions
5. As claude works it copies the logs it generates to a new "# claude logs" section at the end of the current feature.MD file.
6. Once claude has the feature ready it is pushed up to the feature/feature-name branch (matching the .MD file name driving this) and a Draft PR is created by claude to trigger any tests and checks.

6\. Once claude has the feature ready it should be verified normally, and if needed fixed on this branch with new claude instructions added to the feature.MD file for each subsequent round of fixes, redirections, cleanups, tests, whatever the engineer calls for, until the code is finally ready. Each update with new instructions is added to the MD file as "#claude code next 1" then "#claude code next 2" etc. by the engineer after the logs that resulted from the prior pass added by claude at the end of the feature.md file, then claude is re-invoked to pick up the next instructions. Repeated by the engineer as needed.

7\. Once the feature is complete, passing tests, all done, claude is instructed to finalize the feature by removing the Draft status from the PR after pushing up a final round of updates for the final bits of the feature-name.MD updates, if any.

\# Standard claude instructions for the engineer:

1. \*\*Starting instructions\*\* from the engineer typed into claude: "Following the Claude usage standards in src/claude/claude.MD, apply the instructions in src/claude/next-feature-name.MD, logging your work at the end of the MD file per the usage standards, on the feature/copied-next-feature-name-text-from-the-MD-file-name branch"; these instructions from the MD file are then followed by claude and logged normally to the MD file.
2. \*\*Revision instructions\*\* the engineer appends new instructions to the end of the file as a "#claude code next 1" header (the engineer increases the number with each revision) and types into claude:"Following the Claude usage standards in src/claude/claude.MD, apply the instructions in src/claude/next-feature-name.MD under heading claude code next 1, logging your work at the end of the MD file per the usage standards, on the feature/copied-next-feature-name-text-from-the-MD-file-name branch"; these instructions from the MD file are then followed by claude and logged normally to the MD file.
3. \*\*Code and testing complete\*\*, ready for non-draft PR, engineer types into claude: "Following the claude usage standards in src/claude/claude.MD, make sure all changes are in github and included in the PR, after making one final log entry in the feature-name.MD file noting that claude ise now getting the PR ready to apply, then stop logging for this last bit as we push the final branch changes and make the PR non-draft."
