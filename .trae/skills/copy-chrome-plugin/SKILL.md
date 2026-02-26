---
name: "copy-chrome-plugin"
description: "Copies built Chrome extension to specified deployment location. Invoke after webpack compilation completes or when user asks to deploy the plugin."
---

# Copy Chrome Plugin

This skill copies the built Chrome extension directory to a specified deployment location.

## When to Use

Invoke this skill when:
- Webpack compilation has completed successfully
- The `chrome` directory has been built/updated
- User requests to deploy or copy the plugin to a target location
- After running build commands like `npm run chrome` or webpack

## What It Does

1. Checks if the source `chrome` directory exists in the project root
2. Checks if the target directory exists
3. If the target directory exists, deletes it first
4. Copies the entire `chrome` directory to the target location

## Usage

After building the Chrome extension:

```bash
# Build the extension
npx webpack --config webpack.config.js
npx sass sass:css

# Then invoke this skill to copy to deployment location
```

The skill will automatically:
- Verify the source directory exists
- Remove the old deployment if present
- Copy the fresh build to the target location

## Configuration

By default, this skill copies to `E:\chromeplugin`. To change the target location, modify the target path in the skill implementation.

**Note**: Due to security restrictions, the target path must be within the allowed paths. If you need to copy to E:\chromeplugin, you may need to:
1. Manually copy the directory using file explorer
2. Add E:\chromeplugin to the allowed paths in your environment configuration
3. Use a different target location within the allowed paths

## Requirements

- The `chrome` directory must exist in the project root
- The target path must be accessible and within allowed paths
- Write permissions to the target location

## Implementation

The skill uses PowerShell commands to:
- Check source exists: `Test-Path chrome`
- Remove existing directory: `Remove-Item -Recurse -Force <target-path>`
- Copy new directory: `Copy-Item -Recurse chrome <target-path>`

## Example Commands

```powershell
# Copy to E:\chromeplugin (if allowed)
if (Test-Path E:\chromeplugin) { Remove-Item -Recurse -Force E:\chromeplugin }
Copy-Item -Recurse chrome E:\chromeplugin

# Copy to alternative location within project
if (Test-Path .\deploy) { Remove-Item -Recurse -Force .\deploy }
Copy-Item -Recurse chrome .\deploy
```
