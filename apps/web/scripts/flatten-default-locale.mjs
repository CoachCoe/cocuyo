#!/usr/bin/env node
/**
 * Post-build script to flatten the default locale (English) to root.
 *
 * This fixes an issue where the Desktop app's WebView has trouble with
 * meta refresh redirects in the root index.html. By copying English
 * content to root, we serve the app directly without redirects.
 *
 * Before:
 *   dist/index.html     → meta refresh redirect to en/
 *   dist/en/index.html  → actual home page
 *   dist/en/about/      → about page
 *
 * After:
 *   dist/index.html     → actual home page (copied from en/)
 *   dist/about/         → about page (copied from en/)
 *   dist/en/            → kept for explicit /en/ access
 *   dist/es/            → Spanish content
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const defaultLocale = 'en';
const localeDir = path.join(distDir, defaultLocale);

async function copyRecursive(src, dest) {
  const stat = await fs.stat(src);

  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src);

    for (const entry of entries) {
      await copyRecursive(
        path.join(src, entry),
        path.join(dest, entry)
      );
    }
  } else {
    await fs.copyFile(src, dest);
  }
}

async function flattenDefaultLocale() {
  console.log('Flattening default locale to root...');
  console.log(`  Source: ${localeDir}`);
  console.log(`  Destination: ${distDir}`);

  // Check if dist/en exists
  try {
    await fs.access(localeDir);
  } catch {
    console.error(`Error: ${localeDir} does not exist. Run 'next build' first.`);
    process.exit(1);
  }

  // Get all entries in the locale directory
  const entries = await fs.readdir(localeDir, { withFileTypes: true });

  let copied = 0;
  for (const entry of entries) {
    const srcPath = path.join(localeDir, entry.name);
    const destPath = path.join(distDir, entry.name);

    // Skip if destination already exists and is not from a previous flatten
    // (e.g., _next, es, 404, favicon.svg, .nojekyll)
    if (entry.name === '_next' || entry.name === 'es' || entry.name === '404' ||
        entry.name === 'favicon.svg' || entry.name === '.nojekyll') {
      continue;
    }

    // For index.html, always overwrite (this replaces the redirect)
    if (entry.name === 'index.html') {
      await fs.copyFile(srcPath, destPath);
      console.log(`  Copied: ${entry.name} (replaced redirect)`);
      copied++;
      continue;
    }

    // For directories, copy recursively
    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath);
      console.log(`  Copied: ${entry.name}/`);
      copied++;
    }
  }

  console.log(`\nFlattened ${copied} items from /${defaultLocale}/ to root.`);
  console.log('Root now serves English content directly without redirect.');
}

flattenDefaultLocale().catch((error) => {
  console.error('Failed to flatten default locale:', error);
  process.exit(1);
});
