/**
 * Server-side file upload handlers
 * Handles image and file uploads
 */

import { IncomingForm, File as FormidableFile } from 'formidable';
import { NextApiRequest } from 'next';
import path from 'path';
import fs from 'fs';
import { formParse, exists } from '../utils/fs';

const uploadFolder = 'uploaded';

/**
 * Upload files from multipart form data
 */
export const uploadFiles = async (req: NextApiRequest): Promise<string[]> => {
  const form = new IncomingForm({
    uploadDir: uploadFolder,
    keepExtensions: true,
  });

  const uploadPath = path.join('public', uploadFolder);
  const uploadFolderExists = await exists(uploadPath);

  if (!uploadFolderExists) {
    await fs.promises.mkdir(uploadPath);
  }

  form.on(
    'fileBegin',
    (_, file) => (file.path = path.join('public', uploadFolder, file.name!))
  );

  const files = await formParse(form, req);

  const urls = Object.values(files).map((f) =>
    path.join(path.sep, uploadFolder, (<FormidableFile>f).name ?? '')
  );

  return urls;
};
