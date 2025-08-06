#!/usr/bin/env node

import { promises as fs } from 'fs';
import { resolve, dirname, relative, normalize } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const claudeDir = resolve(projectRoot, 'src', 'claude');

function showUsage() {
  console.log('Usage: npm run apply-feature <path-to-file>');
  console.log('');
  console.log('Example: npm run apply-feature src/claude/process/my-feature.MD');
  console.log('');
  console.log('The specified file must be located under src/claude/ directory.');
}

function validatePath(filePath) {
  try {
    // Resolve the absolute path
    const absolutePath = resolve(projectRoot, filePath);
    
    // Check if the file is under src/claude
    const relativePath = relative(claudeDir, absolutePath);
    
    // If relativePath starts with '..' then it's outside src/claude
    if (relativePath.startsWith('..') || relativePath.startsWith('/')) {
      return {
        valid: false,
        error: `Path "${filePath}" is not under src/claude directory. Files must be located under src/claude or its subdirectories.`
      };
    }
    
    return {
      valid: true,
      absolutePath,
      relativePath
    };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid path "${filePath}": ${error.message}`
    };
  }
}

async function readInstructionsFromFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let inInstructionsSection = false;
    let instructions = [];
    
    for (const line of lines) {
      if (line.trim() === '#claude instructions') {
        inInstructionsSection = true;
        continue;
      }
      
      if (inInstructionsSection) {
        // End of instructions if we hit another # header or "End of claude instructions"
        if (line.trim().startsWith('#') && line.trim() !== '#claude instructions') {
          break;
        }
        if (line.trim() === 'End of claude instructions') {
          break;
        }
        
        instructions.push(line);
      }
    }
    
    if (!inInstructionsSection) {
      return {
        success: false,
        error: 'No "#claude instructions" section found in the file'
      };
    }
    
    const instructionText = instructions.join('\n').trim();
    
    if (!instructionText) {
      return {
        success: false,
        error: 'Empty instructions section found'
      };
    }
    
    return {
      success: true,
      instructions: instructionText
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Error reading file: ${error.message}`
    };
  }
}

async function applyFeature() {
  try {
    console.log('🚀 Apply Feature Script');
    console.log('─'.repeat(50));
    
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.error('❌ Error: No file path provided');
      console.log('');
      showUsage();
      process.exit(1);
    }
    
    if (args.length > 1) {
      console.error('❌ Error: Too many arguments provided');
      console.log('');
      showUsage();
      process.exit(1);
    }
    
    const filePath = args[0];
    console.log(`📁 Target file: ${filePath}`);
    
    // Validate the path is under src/claude
    const pathValidation = validatePath(filePath);
    if (!pathValidation.valid) {
      console.error(`❌ ${pathValidation.error}`);
      process.exit(1);
    }
    
    console.log(`✅ Path validated: ${pathValidation.relativePath}`);
    
    // Check if file exists
    try {
      await fs.access(pathValidation.absolutePath);
      console.log('✅ File exists and is accessible');
    } catch (error) {
      console.error(`❌ File not found or not accessible: ${pathValidation.absolutePath}`);
      process.exit(1);
    }
    
    // Read and parse instructions from the file
    const result = await readInstructionsFromFile(pathValidation.absolutePath);
    if (!result.success) {
      console.error(`❌ ${result.error}`);
      process.exit(1);
    }
    
    console.log('✅ Instructions extracted successfully');
    console.log('');
    console.log('📋 Instructions to apply:');
    console.log('─'.repeat(50));
    console.log(result.instructions);
    console.log('─'.repeat(50));
    console.log('');
    
    // In a real Claude integration, this would invoke Claude to process the instructions
    // For now, we'll display what would be done
    console.log('🤖 What would happen next:');
    console.log('1. The instructions would be sent to Claude');
    console.log('2. Claude would read and follow the instructions');
    console.log('3. Claude would log its work at the end of the MD file');
    console.log('4. Changes would be committed to the appropriate branch');
    console.log('');
    console.log('✅ Apply-feature script completed successfully!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

applyFeature();