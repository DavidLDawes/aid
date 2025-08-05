#!/usr/bin/env node

/**
 * Simplified Claude Feature Application Script
 * 
 * Usage: node apply-feature.js <feature-name>
 * Example: node apply-feature.js engine-mass-constraints
 * 
 * This script simplifies the Claude workflow by:
 * 1. Reading the feature-name.MD file
 * 2. Extracting the claude instructions
 * 3. Providing a simple command format for users
 * 4. Including instructions for Draft PR creation
 */

const fs = require('fs');
const path = require('path');

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node apply-feature.js <feature-name>');
        console.log('Example: node apply-feature.js engine-mass-constraints');
        console.log('\nThis will apply the instructions from src/claude/<feature-name>.MD');
        process.exit(1);
    }
    
    const featureName = args[0];
    const featureFile = path.join(__dirname, `${featureName}.MD`);
    
    if (!fs.existsSync(featureFile)) {
        console.error(`Error: Feature file ${featureFile} does not exist.`);
        console.log('\nAvailable feature files:');
        const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.MD') && f !== 'claude.MD');
        files.forEach(f => console.log(`  - ${f.replace('.MD', '')}`));
        process.exit(1);
    }
    
    console.log(`\nTo apply the feature "${featureName}", copy and paste this command to Claude:\n`);
    console.log(`Following the Claude usage standards in src/claude/claude.MD, apply the instructions in src/claude/${featureName}.MD, logging your work at the end of the MD file per the usage guidance from claude.MD, on the feature/${featureName} branch`);
    console.log('\n');
    console.log('After Claude completes the work, it should:');
    console.log('1. Push changes to the feature branch');
    console.log('2. Create a Draft PR using: gh pr create --draft --title "Feature: ' + featureName + '" --body "Implementation of ' + featureName + ' feature"');
    console.log('3. Or visit the GitHub link provided after pushing to create the PR manually');
    console.log('\n');
}

if (require.main === module) {
    main();
}

module.exports = { main };