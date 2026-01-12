import { LayoutConfig, LayoutState } from '@/core/types/layout-store';
export type { LayoutConfig, LayoutState };

export interface AppTopbarRef {
  topbarElement?: HTMLDivElement | null;
  menubutton?: HTMLButtonElement | null;
  topbarmenu?: HTMLDivElement | null;
  topbarmenubutton?: HTMLButtonElement | null;
  toolbarbutton?: HTMLButtonElement | null;
  profileMenuButton?: HTMLButtonElement | null;
}

export interface ChildContainerProps {
  children: React.ReactNode;
}

export interface LayoutContentProps {
  topbarContent?: React.ReactNode;
  leftbarContent?: React.ReactNode;
  rightbarContent?: React.ReactNode;
  bottombarContent?: React.ReactNode;
}

export enum UserRole {
  OWNER = 'OWNER',
  ORG_ADMIN = 'ORG_ADMIN',
  GUEST = 'GUEST',
}

export interface AppMenuItem {
  label: string;
  icon?: string;
  to?: string;
  url?: string;
  items?: AppMenuItem[];
  separator?: boolean;
  disabled?: boolean;
  target?: string;
  class?: string;
  badgeClass?: string;
  badge?: string;
  visible?: boolean;
  replaceUrl?: boolean;
  command?: (event: {
    originalEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>;
    item: AppMenuItem;
  }) => void;
  description?: string;
  keywords?: string[];
  roles?: string[];
}

export interface AppMenuItemProps {
  item: AppMenuItem;
  index: number;
  root?: boolean;
  className?: string;
  parentKey?: string;
}

export interface SearchConfig {
  maxResults?: number;
  minSearchLength?: number;
  fuzzySearch?: boolean;
  searchMode?: 'basic' | 'advanced';
  searchKeys?: string[];
}

export interface SearchableItem {
  label: string;
  icon?: string;
  url?: string;
  to?: string;
  command?: () => void;
  items?: SearchableItem[];
  keywords?: string[];
  description?: string;
  [key: string]: unknown;
}

export interface AppSearchProps<T> {
  searchRef?: React.RefObject<HTMLDivElement | null>;
  menubarRef?: React.RefObject<HTMLDivElement | null>;
  type?: string;
  items?: T[];
  searchConfig?: SearchConfig;
  placeholder?: string;
  onSearchResults?: (results: T[]) => void;
}

export interface User {
  name?: string;
  email?: string;
  image?: string;
  avatar?: string;
  role?: string;
  [key: string]: unknown;
}

export interface LayoutSectionProps {
  children?: React.ReactNode;
}

export interface Message {
  _id: string;
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  link?: string;
  icon?: string;
}

export interface ThemeButtonProps {
  theme: string;
  colorScheme: 'light' | 'dark';
  name: string;
  primary: string;
  secondary: string;
  gradient?: string;
}

export interface ScaleControlProps {
  layoutConfig: LayoutConfig;
  setLayoutConfig: (
    value: LayoutConfig | ((prevState: LayoutConfig) => LayoutConfig)
  ) => void;
  scales: number[];
  t: (key: string) => string;
}

export interface MenuTypeSelectorProps {
  layoutConfig: LayoutConfig;
  layoutState: LayoutState;
  changeMenuMode: (e: { value: string }) => void;
  onSidebarAutoOverlayToggle: () => void;
  t: (key: string) => string;
}

export interface Theme {
  theme: string;
  colorScheme: 'light' | 'dark';
  name: string;
  primary: string;
  secondary: string;
  gradient: string;
}

export interface ThemeContextType {
  layoutConfig: LayoutConfig;
  changeTheme: (theme: string, colorScheme: string) => void;
}

export interface ThemeCategoryProps {
  title: string;
  themes: Theme[];
  currentTheme: string;
  onChangeTheme: (theme: string, colorScheme: string) => void;
}

export interface SliderProps {
  value?: number;
  onChange?: (e: { value: number }) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  range?: boolean;
  className?: string;
}

export interface UseLayoutClassesProps {
  layoutConfig: LayoutConfig;
  layoutState: LayoutState;
}

export type AppTopbarMenuProps = object;

export type AppTopbarMenuRef = null;
