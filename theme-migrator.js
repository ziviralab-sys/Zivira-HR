const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { search: /blue-50(?!0)/g, replace: 'orange-50' },
  { search: /blue-100/g, replace: 'orange-100' },
  { search: /blue-200/g, replace: 'orange-200' },
  { search: /blue-300/g, replace: 'orange-300' },
  { search: /blue-400/g, replace: 'orange-400' },
  { search: /blue-500/g, replace: 'orange-500' },
  { search: /blue-600/g, replace: 'orange-600' },
  { search: /blue-700/g, replace: 'orange-700' },
  { search: /blue-800/g, replace: 'orange-800' },
  { search: /blue-900/g, replace: 'orange-900' },
  { search: /#3b82f6/gi, replace: '#f97316' }, // blue-500 -> orange-500
  { search: /#2563eb/gi, replace: '#ea580c' }, // blue-600 -> orange-600
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const rule of replacements) {
        if (rule.search.test(content)) {
          content = content.replace(rule.search, rule.replace);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

console.log('Starting theme migration...');
processDirectory(srcDir);
console.log('Theme migration complete!');
