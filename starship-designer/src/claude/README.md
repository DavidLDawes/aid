# Simplified Claude Feature Application Process

This directory contains a simplified workflow for applying Claude instructions to features.

## Quick Start

Instead of manually typing the full Claude command, you can now use:

```bash
node src/claude/apply-feature.js <feature-name>
```

This will generate the proper Claude command for you to copy and paste.

## Example

```bash
node src/claude/apply-feature.js claude-logs
```

Output:
```
Following the Claude usage standards in src/claude/claude.MD, apply the instructions in src/claude/claude-logs.MD, logging your work at the end of the MD file per the usage guidance from claude.MD, on the feature/claude-logs branch
```

## Workflow

1. Create your `feature-name.MD` file with `#claude instructions` section
2. Run `node src/claude/apply-feature.js feature-name` 
3. Copy the generated command and paste it to Claude
4. Claude will automatically:
   - Switch to the `feature/feature-name` branch
   - Apply the instructions from the MD file
   - Log work at the end of the MD file

## Original Process

The full process is documented in `claude.MD` but this simplified approach handles the command generation for you.