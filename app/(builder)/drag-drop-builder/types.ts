/**
 * Type definitions for the drag-drop-builder feature
 */

export interface DataType {
  content: string;
  name?: string;
}

export interface RootProps {
  childNodes: RootProps[];
  attrs?: Record<string, unknown>;
  tagName: string;
  classNames: string;
  nodeType: number;
  innerText: string;
  constructor: string | { name: string };
}

export interface Component {
  source: string;
  folder: string;
}

export interface ComponentWithCategories {
  [category: string]: Component[];
}

export interface Theme {
  name: string;
  folder: string;
}

export interface BuilderState {
  selectedElement: HTMLElement | null;
  currentTheme: number;
  showImageDialog: boolean;
  showButtonDialog: boolean;
  showLinkDialog: boolean;
  showSvgDialog: boolean;
}

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  element: HTMLElement | null;
  standaloneServer: boolean;
}
