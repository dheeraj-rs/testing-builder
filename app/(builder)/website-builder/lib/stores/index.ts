// Store exports
export { chatStore } from './chat';
import { workbenchStore } from './workbench';

export * from './theme';
export * from './workbench';

export const filesStore = workbenchStore.filesStore;
export const editorStore = workbenchStore.editorStore;
export const terminalStore = workbenchStore.terminalStore;
export const previewsStore = workbenchStore.previewsStore;
