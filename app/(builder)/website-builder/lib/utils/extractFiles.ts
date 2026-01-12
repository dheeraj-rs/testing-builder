import type { FileMap } from '@/app/(builder)/website-builder/lib/stores/files';

/**
 * Extract files from the WebContainer file map for deployment
 * Filters out unnecessary files and formats them for the Vercel API
 */
export function extractFilesForDeployment(
  files: FileMap
): Array<{ path: string; content: string }> {
  const deploymentFiles: Array<{ path: string; content: string }> = [];

  // Directories and files to exclude from deployment
  const excludePatterns = [
    /^node_modules\//,
    /^\.git\//,
    /^\.next\//,
    /^\.vercel\//,
    /^dist\//,
    /^build\//,
    /\.log$/,
    /^\.env/,
    /^\.DS_Store$/,
  ];

  for (const [filePath, fileData] of Object.entries(files)) {
    // Skip if file matches any exclude pattern
    const shouldExclude = excludePatterns.some((pattern) =>
      pattern.test(filePath)
    );
    if (shouldExclude) {
      continue;
    }

    // Skip if it's a directory (no content)
    if (!fileData || fileData.type === 'folder') {
      continue;
    }

    // Get file content
    const content = fileData.content || '';

    // Strip /home/project/ prefix to make paths relative for Vercel
    // Vercel expects relative paths like "index.html" not "/home/project/index.html"
    let relativePath = filePath;
    if (relativePath.startsWith('/home/project/')) {
      relativePath = relativePath.substring('/home/project/'.length);
    } else if (relativePath.startsWith('/')) {
      // Remove leading slash if present
      relativePath = relativePath.substring(1);
    }

    // Add to deployment files
    deploymentFiles.push({
      path: relativePath,
      content,
    });
  }

  return deploymentFiles;
}

/**
 * Validate that required files exist for deployment
 */
export function validateDeploymentFiles(
  files: Array<{ path: string; content: string }>
): {
  valid: boolean;
  error?: string;
} {
  if (files.length === 0) {
    return {
      valid: false,
      error: 'No files found. Please generate a website first.',
    };
  }

  // Check if there's at least one HTML file or index file
  const hasIndexFile = files.some(
    (f) => f.path === 'index.html' || f.path.endsWith('/index.html')
  );
  const hasPackageJson = files.some((f) => f.path === 'package.json');

  if (!hasIndexFile && !hasPackageJson) {
    return {
      valid: false,
      error:
        'No index.html or package.json found. The website may not deploy correctly.',
    };
  }

  return { valid: true };
}
