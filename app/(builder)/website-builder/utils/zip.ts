import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { FileMap } from '@/app/(builder)/website-builder/lib/stores/files';
import { WORK_DIR } from '@/app/(builder)/website-builder/utils/constants';

export const exportProjectAsZip = async (files: FileMap) => {
  const zip = new JSZip();

  // Try to find package.json to get project name
  let projectName = 'project';
  const packageJsonEntry = files[`${WORK_DIR}/package.json`];

  if (packageJsonEntry && packageJsonEntry.type === 'file') {
    try {
      const packageJson = JSON.parse(packageJsonEntry.content);
      if (packageJson.name) {
        projectName = packageJson.name;
      }
    } catch (e) {
      console.error('Failed to parse package.json for project name', e);
    }
  }

  // Recursive function to add files and folders to the zip
  const addToZip = (currentFiles: FileMap) => {
    Object.entries(currentFiles).forEach(([path, dirent]) => {
      if (!dirent) return;

      // Strip WORK_DIR from path to make it relative to project root
      // e.g. /home/project/src/index.js -> src/index.js
      let zipPath = path;

      if (path.startsWith(WORK_DIR)) {
        zipPath = path.substring(WORK_DIR.length);
      }

      // Remove leading slash if present
      if (zipPath.startsWith('/')) {
        zipPath = zipPath.substring(1);
      }

      // Skip files outside of WORK_DIR or empty paths
      // This ensures we only export the project files
      if (!path.startsWith(WORK_DIR) || !zipPath) {
        return;
      }

      if (dirent.type === 'file') {
        zip.file(zipPath, dirent.content);
      } else if (dirent.type === 'folder') {
        zip.folder(zipPath);
      }
    });
  };

  addToZip(files);

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${projectName}.zip`);
};
