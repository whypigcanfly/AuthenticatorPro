---
name: "manifest-validator"
description: "Validates manifest.json file for syntax errors and common issues. Invoke before building the extension or when manifest-related errors occur."
---

# Manifest Validator

This skill validates the Chrome extension manifest.json file to catch common syntax errors and configuration issues before building.

## When to Invoke

Invoke this skill when:
- Before running `npx webpack` to build the extension
- When encountering manifest loading errors
- After making changes to manifest files
- User asks to validate manifest file

## Validation Checks

### 1. JSON Syntax Validation
- Validates JSON syntax
- Checks for missing commas, brackets, quotes
- Ensures proper JSON formatting

### 2. Required Fields Check
- Verifies all required manifest v3 fields are present
- Checks for: manifest_version, name, version

### 3. Content Scripts Validation
- Validates content_scripts structure
- Checks matches array format (must be single-line array)
- Verifies js paths are correct

### 4. Permissions Validation
- Checks for duplicate permissions
- Validates permission names
- Ensures no typos in permission names

### 5. Common Issues Detection
- Detects common manifest pitfalls
- Provides specific error messages

## Usage

### Command Line
```bash
# Navigate to project root
cd /path/to/AuthenticatorPro

# Invoke the skill
trae skill manifest-validator
```

### Integration with Build Process

To automatically validate before every build, add to your build script:

**package.json** (add a prebuild script):
```json
{
  "scripts": {
    "prebuild": "trae skill manifest-validator && npx webpack"
  }
}
```

Then use:
```bash
npm run prebuild
```

## Validation Output

The skill will output:

✅ **PASS**: Manifest is valid
❌ **FAIL**: Manifest has errors

If errors are found, the skill will:
1. Display the specific error
2. Show the file path and line number
3. Provide suggestions for fixing the issue

## Common Manifest Errors

| Error Type | Description | Fix |
|-------------|-------------|-----|
| Invalid JSON | Check syntax with a JSON validator |
| Wrong matches format | Use `["<all_urls>"]` not multi-line array |
| Missing required fields | Add manifest_version, name, version |
| Invalid permission | Check Chrome extension API docs |
| Duplicate permissions | Remove duplicates from permissions array |

## Examples

### Example 1: Valid Manifest
```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
```

### Example 2: Invalid matches Format
```json
{
  "content_scripts": [
    {
      "matches": [
        "<all_urls>"
      ],
      "js": ["content.js"]
    }
  ]
}
```

**Error**: matches array should be single-line, not multi-line

## Implementation Notes

- Uses Node.js to read and parse manifest files
- Validates against Chrome Extension Manifest V3 schema
- Provides clear, actionable error messages
- Supports both manifest-chrome.json and manifest-firefox.json
