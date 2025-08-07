const fs = require('fs');
const path = require('path');

// Polyfill template
const polyfill = `
// Polyfill for structuredClone
const safeStructuredClone = typeof structuredClone !== 'undefined' 
  ? structuredClone 
  : function(obj) {
      try {
        return JSON.parse(JSON.stringify(obj));
      } catch (e) {
        // Fallback for objects with circular references
        const seen = new WeakMap();
        return JSON.parse(JSON.stringify(obj, function(key, val) {
          if (val != null && typeof val === "object") {
            if (seen.has(val)) {
              return {};
            }
            seen.set(val, true);
          }
          return val;
        }));
      }
    };
`;

// Function to patch a file
function patchFile(filePath, fileName) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already patched
    if (!content.includes('const safeStructuredClone')) {
      // Replace structuredClone usage with our safe version
      content = content.replace(/structuredClone\(/g, 'safeStructuredClone(');
      
      // Add the polyfill at the beginning (after any existing imports/requires)
      const lines = content.split('\n');
      const insertIndex = Math.max(
        lines.findIndex(line => line.includes('require(')) + 1,
        lines.findIndex(line => line.includes('Object.defineProperty')) + 1,
        3
      );
      lines.splice(insertIndex, 0, polyfill);
      
      content = lines.join('\n');
      
      fs.writeFileSync(filePath, content);
      console.log(`Successfully patched fake-indexeddb ${fileName}`);
    } else {
      console.log(`fake-indexeddb ${fileName} already patched`);
    }
  } else {
    console.log(`fake-indexeddb ${fileName} not found`);
  }
}

// Patch multiple files
const filesToPatch = [
  'FDBObjectStore.js',
  'lib/ObjectStore.js',
  'lib/Index.js'
];

filesToPatch.forEach(file => {
  const filePath = path.join(__dirname, 'node_modules', 'fake-indexeddb', 'build', 'cjs', file);
  patchFile(filePath, file);
});