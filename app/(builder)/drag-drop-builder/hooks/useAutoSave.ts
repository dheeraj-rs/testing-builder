/**
 * Custom hook for auto-saving builder changes
 */

import { useRef } from 'react';
import { debounce } from '../lib/builderUtils';
import { savePage } from '../lib/builderApi';

export function useAutoSave(standaloneServer: boolean) {
  const savePageDebounced = useRef(
    debounce((html: string) => {
      savePage(html, standaloneServer);
    }, 1000)
  );

  const triggerSave = (html: string) => {
    savePageDebounced.current(html);
  };

  return { triggerSave };
}
