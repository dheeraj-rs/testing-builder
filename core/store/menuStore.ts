import { create } from 'zustand';
import { MenuStore } from '@/core/types/layout-store';

export const useMenuStore = create<MenuStore>((set) => ({
  activeMenu: '',
  setActiveMenu: (menu) => set({ activeMenu: menu }),
}));
