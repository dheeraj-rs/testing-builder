import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Extract all image URLs from HTML content that reference the /uploaded/ folder
 */
const extractUploadedImageUrls = (htmlContent: string): string[] => {
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  const urls: string[] = [];
  let match;

  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    // Only include images from the /uploaded/ folder
    if (url.includes('/uploaded/')) {
      urls.push(url);
    }
  }

  return [...new Set(urls)]; // Remove duplicates
};

/**
 * Fetch an image and convert it to base64 data URI
 */
const fetchImageAsBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Failed to fetch image: ${imageUrl}`, error);
    return imageUrl; // Return original URL if fetch fails
  }
};

/**
 * Fetch an image as a blob for bundling in zip
 */
const fetchImageAsBlob = async (imageUrl: string): Promise<Blob | null> => {
  try {
    const response = await fetch(imageUrl);
    return await response.blob();
  } catch (error) {
    console.error(`Failed to fetch image: ${imageUrl}`, error);
    return null;
  }
};

/**
 * Export as standalone HTML file with inline Tailwind CSS CDN and embedded images
 */
export const exportAsHTML = async (htmlContent: string) => {
  // Extract uploaded image URLs
  const imageUrls = extractUploadedImageUrls(htmlContent);

  // Convert images to base64 and replace in HTML
  let processedHtml = htmlContent;
  for (const imageUrl of imageUrls) {
    const base64 = await fetchImageAsBase64(imageUrl);
    // Replace all occurrences of this image URL with base64
    processedHtml = processedHtml.replace(new RegExp(imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), base64);
  }

  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Page</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"></link>
</head>
<body>
${processedHtml}
</body>
</html>`;

  const blob = new Blob([fullHTML], { type: 'text/html' });
  saveAs(blob, 'page.html');
};

/**
 * Export as React + Vite + Tailwind CSS project with bundled images
 */
export const exportAsReactProject = async (htmlContent: string) => {
  const zip = new JSZip();

  // Extract uploaded image URLs and bundle them
  const imageUrls = extractUploadedImageUrls(htmlContent);

  // Create public folder and add images
  const publicFolder = zip.folder('public');
  const uploadedFolder = publicFolder?.folder('uploaded');

  for (const imageUrl of imageUrls) {
    const blob = await fetchImageAsBlob(imageUrl);
    if (blob && uploadedFolder) {
      // Extract filename from URL
      const filename = imageUrl.split('/uploaded/').pop() || 'image.png';
      uploadedFolder.file(filename, blob);
    }
  }

  // 1. package.json
  const packageJson = {
    name: 'react-tailwind-project',
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    },
    devDependencies: {
      '@types/react': '^18.0.28',
      '@types/react-dom': '^18.0.11',
      '@vitejs/plugin-react': '^4.2.1',
      autoprefixer: '^10.4.16',
      postcss: '^8.4.32',
      tailwindcss: '^3.4.0',
      vite: '^5.2.0',
    },
  };
  zip.file('package.json', JSON.stringify(packageJson, null, 2));

  // 2. vite.config.js
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`;
  zip.file('vite.config.js', viteConfig);

  // 3. tailwind.config.js
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
  zip.file('tailwind.config.js', tailwindConfig);

  // 4. postcss.config.js
  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  zip.file('postcss.config.js', postcssConfig);

  // 5. index.html
  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
  zip.file('index.html', indexHtml);

  // 6. src/index.css
  const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`;
  zip.folder('src')?.file('index.css', indexCss);

  // 7. src/main.jsx
  const mainJsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
  zip.folder('src')?.file('main.jsx', mainJsx);

  // 8. src/App.jsx
  const appJsx = `import React from 'react';

function App() {
  return (
    <div dangerouslySetInnerHTML={{ __html: \`${htmlContent
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$')}\` }} />
  );
}

export default App;`;
  zip.folder('src')?.file('App.jsx', appJsx);

  // 9. README.md
  const readme = `# React + Vite + Tailwind CSS Project

This project was exported from the Drag-Drop Builder.

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run development server:
\`\`\`bash
npm run dev
\`\`\`

3. Build for production:
\`\`\`bash
npm run build
\`\`\`
`;
  zip.file('README.md', readme);

  // Generate ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'react-tailwind-project.zip');
};

// Legacy export - keeping for backward compatibility
export const exportDragDropProject = exportAsReactProject;
