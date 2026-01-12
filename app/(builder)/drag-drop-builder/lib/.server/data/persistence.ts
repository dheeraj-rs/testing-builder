/**
 * Server-side data persistence handlers
 * Handles loading and saving HTML pages
 */

import fs from 'fs';
import path from 'path';
import { exists, readdirRecursive } from '../utils/fs';
import { DataType } from '../../../types';

const rootPath = process.cwd();
const dataFolder = 'public/data';

/**
 * Convert route to filename
 */
const getFileNameFromRoute = (route: string) =>
  route === '/' ? 'default' : route;

/**
 * Convert filename to route
 */
const getRouteFromFilename = (filename: string) =>
  filename.slice(0, -5) === path.sep + 'default' ? path.sep : filename;

/**
 * Load page data from file system
 */
export const loadData = async (route: string, ext: string): Promise<string> => {
  const fileName = getFileNameFromRoute(route);
  const dataPath = path.join(rootPath, dataFolder, `${fileName}.${ext}`);
  const dataExists = await exists(dataPath);

  if (!dataExists) {
    return ext === 'json' ? '{}' : '<div>Not found</div>';
  }

  const content = fs.readFileSync(dataPath, 'utf8');
  return content;
};

/**
 * Fix paths for cross-platform compatibility
 */
const fixPaths = (c: { name: string; content: string }, basePath: string) => {
  const nameWithoutBasePath = getRouteFromFilename(
    c.name.replace(basePath, '')
  );
  const nameWithFixSeps = nameWithoutBasePath.split(path.sep).join('/');
  return { content: c.content, name: nameWithFixSeps };
};

/**
 * Load all data files from public/data directory
 */
export const loadAllData = async (): Promise<DataType[]> => {
  const basePath = path.join(rootPath, dataFolder);
  const files = readdirRecursive(basePath) as string[];

  const data = await Promise.all(
    files.map((f) =>
      fs.promises
        .readFile(f, 'utf8')
        .then((c) => ({ name: f, content: c }))
        .then((c) => fixPaths(c, basePath))
    )
  );

  return data;
};

/**
 * Save page data to file system
 */
export const updateData = async (
  route: string,
  ext: string,
  data: string
): Promise<void> => {
  const fileName = getFileNameFromRoute(route);
  const updatePath = path.join(rootPath, dataFolder);

  const updateFolderExists = await exists(updatePath);
  if (!updateFolderExists) {
    await fs.promises.mkdir(updatePath);
  }

  await fs.promises.writeFile(
    path.join(updatePath, `${fileName}.${ext}`),
    data
  );
};
