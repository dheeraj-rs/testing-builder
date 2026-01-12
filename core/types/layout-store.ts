import { SearchableItem } from '@/core/types/admin-layout';

export interface LayoutConfig {
  ripple: boolean;
  inputStyle: 'outlined' | 'filled';
  menuMode: 'static' | 'overlay';
  colorScheme: 'light' | 'dark';
  theme: string;
  scale: number;
  secretKey: string;
}

export interface LayoutState {
  staticMenuDesktopInactive: boolean;
  staticConfigDesktopInactive: boolean;
  staticBottombarDesktopInactive: boolean;
  overlayMenuActive: boolean;
  overlayConfigActive: boolean;
  overlayBottombarActive: boolean;
  profileSidebarVisible: boolean;
  configSidebarVisible: boolean;
  topbarAutoHide: boolean;
  staticMenuMobileActive: boolean;
  staticConfigMobileActive: boolean;
  staticBottombarMobileHide: boolean;
  menuHoverActive: boolean;
  sidebarAutoOverlayActive: boolean;
  searchSidebarItems: SearchableItem[];
  navbarStickyToggle: boolean;
  bottombarStickyToggle: boolean;
}

export interface LayoutStore {
  layoutConfig: LayoutConfig;
  layoutState: LayoutState;
  isHydrated: boolean;
  language: string;
  setLayoutConfig: (
    config: Partial<LayoutConfig> | ((prev: LayoutConfig) => LayoutConfig)
  ) => void;
  setLayoutState: (
    state: Partial<LayoutState> | ((prev: LayoutState) => LayoutState)
  ) => void;
  setLanguage: (lang: string) => void;
  onMenuToggle: () => void;
  onConfigToggle: () => void;
  onBottombarToggle: () => void;
  onTopbarToggle: () => void;
  onNavbarStickyToggle: () => void;
  onBottombarStickyToggle: () => void;
  onSidebarAutoOverlayToggle: () => void;
  showProfileSidebar: () => void;
  setIsHydrated: (hydrated: boolean) => void;
}

export interface MenuStore {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}
