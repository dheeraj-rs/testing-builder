/**
 * Server-side theme loading handlers
 * Handles loading theme components and assets
 */

import fs from 'fs';
import path from 'path';

/**
 * Get package path
 */
export const getPackagePath = () => {
  return path.join(process.cwd(), 'app', '(builder)', 'drag-drop-builder');
};

/**
 * Get themes directory path
 */
export const getThemesPath = () => {
  return path.join(process.cwd(), 'public', 'builder-themes');
};

/**
 * Load theme components
 */
export const loadThemeComponents = async (themeName: string) => {
  const folderPath = path.join(getThemesPath(), themeName);

  const componentNames = await fs.promises
    .readdir(folderPath)
    .then((f) => f.filter((c) => c !== 'index.ts' && !c.startsWith('.')));

  const componentsP = componentNames.map(async (c) => {
    const assetPath = path.join(folderPath, c, 'index.html');
    const source = await fs.promises.readFile(assetPath, 'utf-8');
    return { source, folder: c };
  });

  const components = await Promise.all(componentsP);
  return components;
};

/**
 * Load theme asset (image, etc.)
 */
export const loadThemeAsset = async (assetPath: string): Promise<Buffer> => {
  let fullPath;

  if (assetPath.startsWith('/themes')) {
    fullPath = path.join(getThemesPath(), assetPath.replace('/themes', ''));
  } else {
    fullPath = path.join(getPackagePath(), assetPath);
  }

  const data = await fs.promises.readFile(fullPath);
  return data;
};
