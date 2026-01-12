import { useRef, useEffect, useCallback, useState } from 'react';

export function useScrollLock(
  autoLock: boolean = false,
  lockTarget: HTMLElement | string | null = null,
  widthReflow = true
) {
  const target = useRef<HTMLElement | null>(null);
  const originalStyle = useRef<{
    overflow: string;
    paddingRight: string;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Detect client-side rendering to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const enableScrollLock = useCallback(() => {
    if (!isClient || !target.current) return;

    const { overflow, paddingRight } = target.current.style;
    originalStyle.current = { overflow, paddingRight };

    if (widthReflow && typeof window !== 'undefined') {
      const offsetWidth = window.innerWidth - document.body.offsetWidth;
      if (offsetWidth > 0) {
        target.current.style.paddingRight = `${offsetWidth}px`;
      }
    }

    target.current.style.overflow = 'hidden';
  }, [widthReflow, isClient]);

  const disableScrollLock = useCallback(() => {
    if (!isClient || !target.current || !originalStyle.current) return;

    target.current.style.overflow = originalStyle.current.overflow;
    target.current.style.paddingRight = originalStyle.current.paddingRight;
    originalStyle.current = null;
  }, [isClient]);

  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      if (typeof lockTarget === 'string') {
        target.current = document.querySelector(lockTarget);
      } else {
        target.current = (lockTarget as HTMLElement) || document.body;
      }
    }
  }, [lockTarget, isClient]);

  useEffect(() => {
    if (!isClient) return;

    if (autoLock) {
      enableScrollLock();
    } else {
      disableScrollLock();
    }
  }, [autoLock, enableScrollLock, disableScrollLock, isClient]);

  useEffect(() => {
    return () => {
      if (isClient) {
        disableScrollLock();
      }
    };
  }, [disableScrollLock, isClient]);

  return { isLocked: autoLock, enableScrollLock, disableScrollLock };
}
