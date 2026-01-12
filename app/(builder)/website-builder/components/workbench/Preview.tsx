import { useStore } from '@nanostores/react';
import { memo, useRef } from 'react';
import { iframeUrlStore, previewRefreshTrigger } from '@/app/(builder)/website-builder/lib/stores/preview';

export const Preview = memo(() => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeUrl = useStore(iframeUrlStore);
  const refreshTrigger = useStore(previewRefreshTrigger);

  return (
    <div className="w-full h-full flex flex-col bg-surface-0">
      <div className="flex-1 w-full h-full relative">
        {iframeUrl ? (
          <iframe
            key={refreshTrigger}
            ref={iframeRef}
            className="border-none w-full h-full absolute inset-0"
            src={iframeUrl}
            allow="clipboard-read; clipboard-write"
            onLoad={() => console.log('[Preview] Iframe loaded:', iframeUrl)}
            onError={(e) => console.error('[Preview] Iframe error:', e)}
          />
        ) : (
          <div className="flex w-full h-full justify-center items-center text-text-secondary">
            No preview available
          </div>
        )}
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';
