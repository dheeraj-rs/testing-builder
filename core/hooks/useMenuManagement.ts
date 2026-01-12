import { RefObject, useCallback, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEventListener } from './useEventListener';
import { useScrollLock } from './useScrollLock';

import { LayoutState } from '@/core/types/layout-store';

interface UseMenuManagementProps {
  layoutState: LayoutState;
  setLayoutState: (
    state: Partial<LayoutState> | ((prev: LayoutState) => LayoutState)
  ) => void;

  menubarRef: RefObject<HTMLDivElement | null>;
  configbarRef: RefObject<HTMLDivElement | null>;
}

export const useMenuManagement = ({
  layoutState,
  setLayoutState,
  menubarRef,
  configbarRef,
}: UseMenuManagementProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { enableScrollLock, disableScrollLock } = useScrollLock();

  const hideMenu = useCallback(() => {
    setLayoutState((prevLayoutState: LayoutState) => ({
      ...prevLayoutState,
      overlayMenuActive: false,
      overlayConfigActive: false,
      staticMenuMobileActive: false,
      staticConfigMobileActive: false,
      menuHoverActive: false,
    }));
    disableScrollLock();
  }, [setLayoutState, disableScrollLock]);

  const hideProfileMenu = useCallback(() => {
    setLayoutState((prevLayoutState: LayoutState) => ({
      ...prevLayoutState,
      profileSidebarVisible: false,
    }));
  }, [setLayoutState]);

  const [bindMenuOutsideClickListener, unbindMenuOutsideClickListener] =
    useEventListener({
      type: 'click',
      listener: (event) => {
        const target = event.target as HTMLElement;
        const isOutsideClicked = !(
          menubarRef.current?.isSameNode(target) ||
          menubarRef.current?.contains(target) ||
          configbarRef.current?.isSameNode(target) ||
          configbarRef.current?.contains(target) ||
          target.closest('.layout-topbar-menu') ||
          target.closest('.layout-topbar-menu-button')
        );

        if (isOutsideClicked) {
          hideMenu();
        }
      },
    });

  const [
    bindProfileMenuOutsideClickListener,
    unbindProfileMenuOutsideClickListener,
  ] = useEventListener({
    type: 'click',
    listener: (event) => {
      const target = event.target as HTMLElement;
      const isOutsideClicked = !(
        target.closest('.layout-topbar-menu') ||
        target.closest('.layout-topbar-menu-button')
      );

      if (isOutsideClicked) {
        hideProfileMenu();
      }
    },
  });

  useEffect(() => {
    hideMenu();
    hideProfileMenu();
  }, [pathname, searchParams, hideMenu, hideProfileMenu]);

  useEffect(() => {
    if (
      layoutState.overlayMenuActive ||
      layoutState.overlayConfigActive ||
      layoutState.staticMenuMobileActive ||
      layoutState.staticConfigMobileActive
    ) {
      bindMenuOutsideClickListener();
    }

    return () => {
      unbindMenuOutsideClickListener();
    };
  }, [
    layoutState.overlayMenuActive,
    layoutState.overlayConfigActive,
    layoutState.staticMenuMobileActive,
    layoutState.staticConfigMobileActive,
    bindMenuOutsideClickListener,
    unbindMenuOutsideClickListener,
  ]);

  useEffect(() => {
    if (layoutState.profileSidebarVisible) {
      bindProfileMenuOutsideClickListener();
    }

    return () => {
      unbindProfileMenuOutsideClickListener();
    };
  }, [
    layoutState.profileSidebarVisible,
    bindProfileMenuOutsideClickListener,
    unbindProfileMenuOutsideClickListener,
  ]);

  useEffect(() => {
    if (layoutState.staticMenuMobileActive) {
      enableScrollLock();
    } else {
      disableScrollLock();
    }
  }, [layoutState.staticMenuMobileActive, enableScrollLock, disableScrollLock]);

  useEffect(() => {
    if (layoutState.staticConfigMobileActive) {
      enableScrollLock();
    } else {
      disableScrollLock();
    }
  }, [
    layoutState.staticConfigMobileActive,
    enableScrollLock,
    disableScrollLock,
  ]);

  useEffect(() => {
    return () => {
      unbindMenuOutsideClickListener();
      unbindProfileMenuOutsideClickListener();
    };
  }, [unbindMenuOutsideClickListener, unbindProfileMenuOutsideClickListener]);
};
