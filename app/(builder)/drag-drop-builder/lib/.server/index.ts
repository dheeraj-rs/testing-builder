/**
 * Main server-side API handler
 * Central entry point for all builder API requests
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { loadData, updateData } from './data/persistence';
import { loadThemeComponents, loadThemeAsset } from './themes/loader';
import { uploadFiles } from './uploads/handler';
import { getPage } from './utils/fs';

const development = process.env.NODE_ENV !== 'production';

/**
 * Handle data requests (GET/POST for HTML pages)
 */
const handleData = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.method === 'GET') {
    const data = await loadData(
      req.query.path as string,
      (req.query.ext as string) ?? 'html'
    );
    return res.status(200).send(data);
  }

  // POST request
  const contentType = req.headers['content-type']!;
  const isMultiPart = contentType.startsWith('multipart/form-data');

  if (!isMultiPart) {
    const body = await getPage(req);
    await updateData(
      req.query.path as string,
      (req.query.ext as string) ?? 'html',
      body
    );
    return res.status(200).send('');
  } else {
    const urls = await uploadFiles(req);
    return res.status(200).json(urls);
  }
};

/**
 * Handle asset requests (GET for images, etc.)
 */
const handleAsset = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = await loadThemeAsset(req.query.path as string);

  const options = {
    'Content-Type': 'image/png',
    'Content-Length': data.length,
  };

  res.writeHead(200, options);
  res.end(data, 'binary');
};

/**
 * Handle theme requests (GET for theme components)
 */
const handleTheme = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const themeName = req.query.name as string;
  const components = await loadThemeComponents(themeName);

  res.json(components);
};

/**
 * Main API handler - routes requests to appropriate handlers
 */
export const handleEditor = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  // Only allow in development
  if (!development) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Route to appropriate handler
  if (req.query.type === 'data') {
    return handleData(req, res);
  } else if (req.query.type === 'asset') {
    return handleAsset(req, res);
  } else if (req.query.type === 'theme') {
    return handleTheme(req, res);
  } else {
    return res.status(400).json({ error: 'Invalid type' });
  }
};

// Export config for Next.js API routes
export const config = { api: { bodyParser: false } };
