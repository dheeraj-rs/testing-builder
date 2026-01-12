/**
 * Server-side utilities for file system operations
 * Moved from server/utils/index.ts for better organization
 */

import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { NextApiRequest } from 'next';
import FormidableForm from 'formidable/Formidable';

/**
 * Parse multipart form data from request
 */
export const formParse = (
  form: FormidableForm,
  req: NextApiRequest
): Promise<formidable.Files> =>
  new Promise<formidable.Files>((resolve, reject) => {
    form.parse(req, (err, _, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });

/**
 * Get page content from request body
 */
export const getPage = (req: NextApiRequest): Promise<string> =>
  new Promise<string>((resolve) => {
    if (!req.body) {
      let buffer = '';
      req.on('data', (chunk) => {
        buffer += chunk;
      });
      req.on('end', () => {
        resolve(buffer);
      });
    } else {
      resolve(req.body);
    }
  });

/**
 * Check if file or directory exists
 */
export const exists = (s: fs.PathLike): Promise<boolean> =>
  fs.promises
    .access(s)
    .then(() => true)
    .catch(() => false);

/**
 * Recursively read all files in a directory
 */
export const readdirRecursive = (
  folder: string,
  files: string[] = []
): string[] | void => {
  fs.readdirSync(folder).forEach((file) => {
    const pathAbsolute = path.join(folder, file);
    if (fs.statSync(pathAbsolute).isDirectory()) {
      readdirRecursive(pathAbsolute, files);
    } else {
      files.push(pathAbsolute);
    }
  });
  return files;
};

/**
 * Check if running in Next.js environment
 */
export const isNextJs = path.parse(process.argv[1]).base === 'next';
