import { WebContainer } from '@webcontainer/api';
import { WORK_DIR_NAME } from '@/app/(builder)/website-builder/utils/constants';

interface WebContainerContext {
  loaded: boolean;
}

// Extend Window interface for HMR support
declare global {
  interface Window {
    __webcontainerContext?: WebContainerContext;
    __webcontainer?: Promise<WebContainer>;
  }
}

// HMR support for development
export const webcontainerContext: WebContainerContext =
  typeof window !== 'undefined' && window.__webcontainerContext
    ? window.__webcontainerContext
    : { loaded: false };

if (typeof window !== 'undefined') {
  window.__webcontainerContext = webcontainerContext;
}

// Initialize with noop promise for SSR
export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for SSR
});

// Boot WebContainer only on client-side
if (typeof window !== 'undefined') {
  // HMR support - check for cached WebContainer
  const cachedWebContainer = window.__webcontainer;

  webcontainer =
    cachedWebContainer ??
    Promise.resolve()
      .then(() => {
        return WebContainer.boot({ workdirName: WORK_DIR_NAME });
      })
      .then((webcontainer) => {
        webcontainerContext.loaded = true;
        return webcontainer;
      });

  // Cache for HMR
  window.__webcontainer = webcontainer;
}
