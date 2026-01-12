import { atom } from 'nanostores';

export const activePreviewIndexStore = atom(0);
export const urlStore = atom('');
export const iframeUrlStore = atom<string | undefined>(undefined);
export const previewRefreshTrigger = atom(0);
