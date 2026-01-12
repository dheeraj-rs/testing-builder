import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  LayoutConfig,
  LayoutState,
  LayoutStore,
} from '@/core/types/layout-store';

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  ripple: false,
  inputStyle: 'outlined',
  menuMode: 'static',
  colorScheme: 'dark',
  theme: 'd-admin-dark',
  scale: 14,
  secretKey: '',
};

const DEFAULT_LAYOUT_STATE: LayoutState = {
  staticMenuDesktopInactive: false,
  staticConfigDesktopInactive: true,
  staticBottombarDesktopInactive: false,
  overlayMenuActive: false,
  overlayConfigActive: false,
  overlayBottombarActive: false,
  profileSidebarVisible: false,
  configSidebarVisible: false,
  topbarAutoHide: false,
  staticMenuMobileActive: false,
  staticConfigMobileActive: false,
  staticBottombarMobileHide: false,
  menuHoverActive: false,
  sidebarAutoOverlayActive: true,
  searchSidebarItems: [],
  navbarStickyToggle: false,
  bottombarStickyToggle: true,
};

const isDesktop = (): boolean =>
  typeof window !== 'undefined' && window.innerWidth > 991;

export const useLayoutStore = create<LayoutStore>()(
  devtools(
    persist(
      immer((set) => ({
        layoutConfig: DEFAULT_LAYOUT_CONFIG,
        layoutState: DEFAULT_LAYOUT_STATE,
        isHydrated: false,
        language: 'en',

        setLayoutConfig: (config) =>
          set((state) => {
            if (typeof config === 'function') {
              state.layoutConfig = config(state.layoutConfig);
            } else {
              Object.assign(state.layoutConfig, config);
            }
          }),

        setLayoutState: (stateUpdate) =>
          set((state) => {
            if (typeof stateUpdate === 'function') {
              state.layoutState = stateUpdate(state.layoutState);
            } else {
              Object.assign(state.layoutState, stateUpdate);
            }
          }),

        setLanguage: (lang) =>
          set((state) => {
            state.language = lang;
          }),

        onMenuToggle: () =>
          set((state) => {
            const isOverlay = state.layoutConfig.menuMode === 'overlay';

            if (!isDesktop()) {
              state.layoutState.staticMenuMobileActive =
                !state.layoutState.staticMenuMobileActive;
            } else if (isOverlay) {
              state.layoutState.overlayMenuActive =
                !state.layoutState.overlayMenuActive;
            } else {
              state.layoutState.staticMenuDesktopInactive =
                !state.layoutState.staticMenuDesktopInactive;
            }
          }),

        onConfigToggle: () =>
          set((state) => {
            const isOverlay = state.layoutConfig.menuMode === 'overlay';

            if (!isDesktop()) {
              state.layoutState.staticConfigMobileActive =
                !state.layoutState.staticConfigMobileActive;
            } else if (isOverlay) {
              state.layoutState.overlayConfigActive =
                !state.layoutState.overlayConfigActive;
            } else {
              state.layoutState.staticConfigDesktopInactive =
                !state.layoutState.staticConfigDesktopInactive;
            }
          }),

        onBottombarToggle: () =>
          set((state) => {
            const isOverlay = state.layoutConfig.menuMode === 'overlay';

            if (isOverlay) {
              state.layoutState.overlayBottombarActive =
                !state.layoutState.overlayBottombarActive;
            } else if (isDesktop()) {
              state.layoutState.staticBottombarDesktopInactive =
                !state.layoutState.staticBottombarDesktopInactive;
            } else {
              state.layoutState.staticBottombarMobileHide =
                !state.layoutState.staticBottombarMobileHide;
            }
          }),

        onTopbarToggle: () =>
          set((state) => {
            state.layoutState.topbarAutoHide =
              !state.layoutState.topbarAutoHide;
          }),

        onNavbarStickyToggle: () =>
          set((state) => {
            state.layoutState.navbarStickyToggle =
              !state.layoutState.navbarStickyToggle;
          }),

        onBottombarStickyToggle: () =>
          set((state) => {
            state.layoutState.bottombarStickyToggle =
              !state.layoutState.bottombarStickyToggle;
          }),

        onSidebarAutoOverlayToggle: () =>
          set((state) => {
            state.layoutState.sidebarAutoOverlayActive =
              !state.layoutState.sidebarAutoOverlayActive;
          }),

        showProfileSidebar: () =>
          set((state) => {
            state.layoutState.profileSidebarVisible =
              !state.layoutState.profileSidebarVisible;
          }),

        setIsHydrated: (hydrated) =>
          set((state) => {
            state.isHydrated = hydrated;
          }),
      })),
      {
        name: 'layout-storage',
        partialize: (state) => ({
          layoutConfig: state.layoutConfig,
          layoutState: state.layoutState,
          language: state.language,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setIsHydrated(true);
          }
        },
      }
    ),
    { name: 'LayoutStore' }
  )
);
