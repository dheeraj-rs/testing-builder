export const CSS_CLASSES = {
  SCROLL_LOCK: 'layout__blocked-scroll',
  LAYOUT_WRAPPER: 'layout__wrapper',
  LAYOUT_TOPBAR: 'layout__topbar',
  LAYOUT_SIDEBAR: 'layout__sidebar',
  LAYOUT_CONFIG: 'layout__config',
  LAYOUT_CONTAINER: 'layout__container',
  LAYOUT_BOTTOMBAR: 'layout__bottombar',
  LAYOUT_MASK: 'layout__mask',
} as const;

export const LAYOUT_MODE_CLASSES = {
  OVERLAY: 'layout-overlay',
  STATIC: 'layout-static',
  STATIC_SIDEBAR_INACTIVE: 'layout-static-sidebar-inactive',
  STATIC_CONFIG_INACTIVE: 'layout-static-config-inactive',
  BOTTOMBAR_DESKTOP_INACTIVE: 'layout-bottombar-desktop-inactive',
  BOTTOMBAR_MOBILE_HIDE: 'layout-bottombar-mobile-hide',
  OVERLAY_SIDEBAR_ACTIVE: 'layout-overlay-sidebar-active',
  OVERLAY_CONFIG_ACTIVE: 'layout-overlay-config-active',
  OVERLAY_BOTTOMBAR_ACTIVE: 'layout-overlay-bottombar-active',
  MOBILE_SIDEBAR_ACTIVE: 'layout-mobile-sidebar-active',
  MOBILE_CONFIG_ACTIVE: 'layout-mobile-config-active',
  TOPBAR_AUTO_HIDE: 'layout-topbar-auto-hide',
  SIDEBAR_AUTO_OVERLAY_ACTIVE: 'layout-sidebar-auto-overlay-active',
} as const;

export const D_ADMIN_CLASSES = {
  INPUT_FILLED: 'p-input-filled',
  RIPPLE_DISABLED: 'p-ripple-disabled',
} as const;

export const BREAKPOINTS = {
  DESKTOP: 991,
} as const;

export const SKELETON_STYLES = {
  TOPBAR_HEIGHT: '5rem',
  SIDEBAR_WIDTH: '5rem',
  CONFIG_WIDTH: 0,
  BOTTOMBAR_HEIGHT: 0,
  MIN_HEIGHT: '100vh',
  CONTAINER_MIN_HEIGHT: 'calc(100vh - 5rem)',
} as const;
