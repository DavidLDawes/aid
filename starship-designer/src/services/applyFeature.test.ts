import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

// Test the apply-feature script functionality
describe('Apply Feature Script', () => {
  const testDir = resolve(process.cwd(), 'src/claude/test');
  const testFile = resolve(testDir, 'test-feature.MD');
  const invalidFile = resolve(process.cwd(), 'invalid-test.MD');

  beforeAll(async () => {
    // Create test directory and file
    await fs.mkdir(testDir, { recursive: true });
    
    const testContent = `#claude instructions
This is a test instruction for the apply-feature script.
It should be extracted correctly by the script.

# other section
This should not be included in the instructions.
`;
    
    await fs.writeFile(testFile, testContent, 'utf-8');
    
    // Create a file outside src/claude for invalid path testing
    const invalidContent = `#claude instructions
This file is outside src/claude and should be rejected.
`;
    
    await fs.writeFile(invalidFile, invalidContent, 'utf-8');
  });

  afterAll(async () => {
    // Cleanup test files
    try {
      await fs.unlink(testFile);
      await fs.rmdir(testDir);
      await fs.unlink(invalidFile);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Path validation', () => {
    it('should reject files outside src/claude directory', () => {
      expect(() => {
        execSync('npm run apply-feature package.json', { 
          cwd: process.cwd(), 
          stdio: 'pipe' 
        });
      }).toThrow();
    });

    it('should reject files outside src/claude (absolute path)', () => {
      expect(() => {
        execSync(`npm run apply-feature ${invalidFile}`, { 
          cwd: process.cwd(), 
          stdio: 'pipe' 
        });
      }).toThrow();
    });

    it('should accept files under src/claude directory', () => {
      // This should not throw an error
      const result = execSync('npm run apply-feature src/claude/process/npm-flush-db.MD', { 
        cwd: process.cwd(), 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      expect(result).toContain('Apply Feature Script');
      expect(result).toContain('Instructions extracted successfully');
    });
  });

  describe('Command line argument handling', () => {
    it('should show usage when no arguments provided', () => {
      expect(() => {
        execSync('npm run apply-feature', { 
          cwd: process.cwd(), 
          stdio: 'pipe' 
        });
      }).toThrow();
    });

    it('should show usage when too many arguments provided', () => {
      expect(() => {
        execSync('npm run apply-feature file1.md file2.md', { 
          cwd: process.cwd(), 
          stdio: 'pipe' 
        });
      }).toThrow();
    });
  });

  describe('File processing', () => {
    it('should reject non-existent files', () => {
      expect(() => {
        execSync('npm run apply-feature src/claude/non-existent.MD', { 
          cwd: process.cwd(), 
          stdio: 'pipe' 
        });
      }).toThrow();
    });

    it('should extract instructions from valid files', () => {
      const result = execSync(`npm run apply-feature src/claude/test/test-feature.MD`, { 
        cwd: process.cwd(), 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      expect(result).toContain('Apply Feature Script');
      expect(result).toContain('Instructions extracted successfully');
      expect(result).toContain('This is a test instruction');
      expect(result).not.toContain('other section');
    });
  });

  describe('Integration with existing files', () => {
    it('should successfully process npm-flush-db.MD', () => {
      const result = execSync('npm run apply-feature src/claude/process/npm-flush-db.MD', { 
        cwd: process.cwd(), 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      expect(result).toContain('Apply Feature Script');
      expect(result).toMatch(/Path validated:.*npm-flush-db\.MD/);
      expect(result).toContain('Instructions extracted successfully');
      expect(result).toContain('flushDB');
    });

    it('should successfully process npm-apply-feature.MD', () => {
      const result = execSync('npm run apply-feature src/claude/process/npm-apply-feature.MD', { 
        cwd: process.cwd(), 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      expect(result).toContain('Apply Feature Script');
      expect(result).toMatch(/Path validated:.*npm-apply-feature\.MD/);
      expect(result).toContain('Instructions extracted successfully');
      expect(result).toContain('apply-feature');
    });
  });
});