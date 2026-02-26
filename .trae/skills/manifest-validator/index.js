const fs = require('fs');
const path = require('path');

console.log('[Manifest Validator] Starting validation...');

const sourceManifestPath = path.join(__dirname, '../../../manifests/manifest-chrome.json');
const chromeManifestPath = path.join(__dirname, '../../../chrome/manifest.json');

const manifestPaths = [sourceManifestPath, chromeManifestPath];

let allPassed = true;

for (const manifestPath of manifestPaths) {
  console.log(`[Manifest Validator] Checking manifest file: ${manifestPath}`);

  if (!fs.existsSync(manifestPath)) {
    console.log(`[Manifest Validator] ⚠️  SKIP: File not found: ${manifestPath}`);
    continue;
  }

  let manifest;
  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(manifestContent);
  } catch (parseError) {
    console.error(`[Manifest Validator] ❌ FAIL: Invalid JSON syntax in ${manifestPath}`);
    console.error('[Manifest Validator] Error:', parseError.message);
    allPassed = false;
    continue;
  }

  console.log(`[Manifest Validator] JSON syntax is valid for ${manifestPath}`);

  const errors = [];

  if (!manifest.manifest_version) {
    errors.push('Missing required field: manifest_version');
  }

  if (!manifest.name) {
    errors.push('Missing required field: name');
  }

  if (!manifest.version) {
    errors.push('Missing required field: version');
  }

  if (manifest.manifest_version !== 3) {
    errors.push('Invalid manifest_version: should be 3');
  }

  if (manifest.content_scripts) {
    console.log('[Manifest Validator] Checking content_scripts...');

    for (let i = 0; i < manifest.content_scripts.length; i++) {
      const script = manifest.content_scripts[i];

      if (!script.matches || script.matches.length === 0) {
        errors.push(`content_scripts[${i}]: Missing or empty matches array`);
      }

      if (!script.js || script.js.length === 0) {
        errors.push(`content_scripts[${i}]: Missing or empty js array`);
      }

      if (Array.isArray(script.matches) && script.matches.length === 1) {
        const match = script.matches[0];
        if (match.includes('\n') || match.includes('  ')) {
          errors.push(`content_scripts[${i}]: matches should be single-line array, not multi-line. Found: "${match}"`);
        }
      }
    }
  }

  if (manifest.permissions) {
    const permissions = manifest.permissions;
    const uniquePermissions = [...new Set(permissions)];

    if (permissions.length !== uniquePermissions.length) {
      const duplicates = permissions.filter((p, index) => permissions.indexOf(p) !== index);
      if (duplicates.length > 0) {
        errors.push(`Duplicate permissions found: ${duplicates.join(', ')}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`[Manifest Validator] ❌ FAIL: ${manifestPath} has errors`);
    console.error('[Manifest Validator] Errors:');
    errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error}`);
    });
    allPassed = false;
  } else {
    console.log(`[Manifest Validator] ✅ PASS: ${manifestPath} is valid`);
  }
}

if (allPassed) {
  console.log('[Manifest Validator] ✅ PASS: All manifest files are valid');
  console.log('[Manifest Validator] All checks passed successfully');
  process.exit(0);
} else {
  console.error('[Manifest Validator] ❌ FAIL: One or more manifest files have errors');
  process.exit(1);
}
