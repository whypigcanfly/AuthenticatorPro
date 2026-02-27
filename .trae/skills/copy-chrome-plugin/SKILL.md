---
name: "copy-chrome-plugin"
description: "Copies built Chrome extension to E:\chromeplugin\chrome directory. Invoke after webpack compilation completes or when user requests to deploy the plugin."
---

# Copy Chrome Plugin to Deployment Directory

This skill copies built Chrome extension files to deployment directory `E:\chromeplugin\chrome` after the build process completes.

## When to Use

Invoke this skill automatically after:
- Webpack compilation completes successfully
- User asks to deploy the plugin
- User requests to copy build artifacts to deployment location

## What It Does

1. Removes existing `E:\chromeplugin\chrome` directory (if exists)
2. Creates new `E:\chromeplugin\chrome` directory
3. Copies all necessary files from the build output to the deployment directory

## Prerequisites

- Webpack build must complete successfully
- `chrome/` directory must exist with all build artifacts
- Target directory `E:\chromeplugin\chrome` must be accessible

## Error Handling

If the target directory `E:\chromeplugin\chrome` does not exist or is not accessible, the skill will log an error message.

## Notes

- Existing files in `E:\chromeplugin\chrome` will be overwritten
- This is useful for quick deployment to a local Chrome extension directory
- Select `E:\chromeplugin\chrome` when loading the extension in Chrome
