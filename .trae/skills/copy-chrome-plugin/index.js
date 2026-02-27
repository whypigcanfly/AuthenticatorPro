const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('[Copy Chrome Plugin] Starting deployment...');

const sourcePath = path.join(__dirname, '../../../chrome');
const targetPath = 'E:\\chromeplugin\\chrome';

console.log(`[Copy Chrome Plugin] Source path: ${sourcePath}`);
console.log(`[Copy Chrome Plugin] Target path: ${targetPath}`);

// Check if source directory exists
if (!fs.existsSync(sourcePath)) {
  console.error(`[Copy Chrome Plugin] ❌ FAIL: Source directory not found: ${sourcePath}`);
  console.error('[Copy Chrome Plugin] Please build the Chrome extension first using: npx webpack --config webpack.config.js');
  process.exit(1);
}

console.log('[Copy Chrome Plugin] Source directory exists');

// Remove target directory if exists
if (fs.existsSync(targetPath)) {
  console.log(`[Copy Chrome Plugin] Removing existing directory: ${targetPath}`);
  try {
    execSync(`rmdir /s /q "${targetPath}"`, { stdio: 'inherit' });
    console.log('[Copy Chrome Plugin] Existing directory removed');
  } catch (error) {
    console.error('[Copy Chrome Plugin] ❌ FAIL: Failed to remove existing directory');
    console.error('[Copy Chrome Plugin] Error:', error.message);
    process.exit(1);
  }
}

// Create target directory
console.log(`[Copy Chrome Plugin] Creating target directory: ${targetPath}`);
try {
  execSync(`mkdir "${targetPath}"`, { stdio: 'inherit' });
  console.log('[Copy Chrome Plugin] Target directory created');
} catch (error) {
  console.error('[Copy Chrome Plugin] ❌ FAIL: Failed to create target directory');
  console.error('[Copy Chrome Plugin] Error:', error.message);
  process.exit(1);
}

// Copy all files
console.log('[Copy Chrome Plugin] Copying files...');
try {
  execSync(`xcopy /e /i /y "${sourcePath}\\*" "${targetPath}\\"`, { stdio: 'inherit' });
  console.log('[Copy Chrome Plugin] Files copied successfully');
} catch (error) {
  console.error('[Copy Chrome Plugin] ❌ FAIL: Failed to copy files');
  console.error('[Copy Chrome Plugin] Error:', error.message);
  process.exit(1);
}

console.log('[Copy Chrome Plugin] ✅ PASS: Deployment completed successfully');
console.log(`[Copy Chrome Plugin] Target path: ${targetPath}`);
console.log('[Copy Chrome Plugin] You can now load the extension in Chrome from this directory');
process.exit(0);
