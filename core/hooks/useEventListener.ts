import { useRef, useEffect, useCallback } from 'react';
import { UseEventListenerProps, ListenerType } from '@/core/types/common-hooks';

export const useEventListener = ({
  type,
  listener,
  options,
}: UseEventListenerProps) => {
  const savedListener = useRef<ListenerType | null>(null);

  useEffect(() => {
    savedListener.current = listener;
  }, [listener]);

  const bind = useCallback(() => {
    if (typeof window !== 'undefined' && savedListener.current) {
      window.addEventListener(type, savedListener.current, options);
    }
  }, [type, options]);

  const unbind = useCallback(() => {
    if (typeof window !== 'undefined' && savedListener.current) {
      window.removeEventListener(type, savedListener.current, options);
    }
  }, [type, options]);

  return [bind, unbind] as const;
};
