import fs from 'fs';
import path from 'path';

const rootFiles = fs.readdirSync('.');
for (const file of rootFiles) {
  if (
    file.startsWith('section_') || 
    file.startsWith('found_') || 
    file.startsWith('extracted_') ||
    file.endsWith('.js\\')
  ) {
    const fullPath = path.join('.', file);
    if (fs.statSync(fullPath).isFile()) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted temp file: ${file}`);
    }
  }
}

// Also delete temporary scripts we created in src/
const srcDir = './src';
const srcFiles = fs.readdirSync(srcDir);
const tempScripts = [
  'down-rest.ts',
  'download-assets.ts',
  'extract-all-home.ts',
  'extract-text.ts',
  'extract-wheel.ts',
  'fetch-pages.ts',
  'find-across-all.ts',
  'find-home-methods.ts',
  'inspect-faq.ts'
];

for (const script of tempScripts) {
  const fullPath = path.join(srcDir, script);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`Deleted temp script: ${script}`);
  }
}
