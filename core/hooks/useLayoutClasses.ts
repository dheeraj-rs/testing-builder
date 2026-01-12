import { useMemo } from 'react';
import {
  LAYOUT_MODE_CLASSES,
  D_ADMIN_CLASSES,
  CSS_CLASSES,
} from '../layouts/constants/layout-constants';
import { classMixin } from '../utils/class-mixin';
import { UseLayoutClassesProps } from '@/core/types/admin-layout';

export const useLayoutClasses = ({
  layoutConfig,
  layoutState,
}: UseLayoutClassesProps): string => {
  return useMemo(
    () =>
      classMixin(CSS_CLASSES.LAYOUT_WRAPPER, {
        [LAYOUT_MODE_CLASSES.OVERLAY]: layoutConfig.menuMode === 'overlay',
        [LAYOUT_MODE_CLASSES.STATIC]: layoutConfig.menuMode === 'static',
        [LAYOUT_MODE_CLASSES.STATIC_SIDEBAR_INACTIVE]:
          layoutState.staticMenuDesktopInactive &&
          layoutConfig.menuMode === 'static',
        [LAYOUT_MODE_CLASSES.STATIC_CONFIG_INACTIVE]:
          layoutState.staticConfigDesktopInactive &&
          layoutConfig.menuMode === 'static',
        [LAYOUT_MODE_CLASSES.BOTTOMBAR_DESKTOP_INACTIVE]:
          layoutState.staticBottombarDesktopInactive,
        [LAYOUT_MODE_CLASSES.BOTTOMBAR_MOBILE_HIDE]:
          layoutState.staticBottombarMobileHide,
        [LAYOUT_MODE_CLASSES.OVERLAY_SIDEBAR_ACTIVE]:
          layoutState.overlayMenuActive,
        [LAYOUT_MODE_CLASSES.OVERLAY_CONFIG_ACTIVE]:
          layoutState.overlayConfigActive,
        [LAYOUT_MODE_CLASSES.OVERLAY_BOTTOMBAR_ACTIVE]:
          layoutState.overlayBottombarActive,
        [LAYOUT_MODE_CLASSES.MOBILE_SIDEBAR_ACTIVE]:
          layoutState.staticMenuMobileActive,
        [LAYOUT_MODE_CLASSES.MOBILE_CONFIG_ACTIVE]:
          layoutState.staticConfigMobileActive,
        [D_ADMIN_CLASSES.INPUT_FILLED]: layoutConfig.inputStyle === 'filled',
        [D_ADMIN_CLASSES.RIPPLE_DISABLED]: !layoutConfig.ripple,
        [LAYOUT_MODE_CLASSES.TOPBAR_AUTO_HIDE]: layoutState.topbarAutoHide,
        [LAYOUT_MODE_CLASSES.SIDEBAR_AUTO_OVERLAY_ACTIVE]:
          layoutState.sidebarAutoOverlayActive,
      }),
    [layoutConfig, layoutState]
  );
};
