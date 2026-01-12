import { ComponentType, ReactNode } from 'react';

/**
 * Available layout slots for component placement
 */
export type LayoutSlot =
  | 'topbar'
  | 'leftbar'
  | 'rightbar'
  | 'bottombar'
  | 'content';

/**
 * Metadata for layout configuration
 */
export interface LayoutMetadata {
  title?: string;
  description?: string;
  icon?: string;
  tags?: string[];
}

/**
 * Individual bar component configuration
 */
export interface BarComponent<P = any> {
  /** Unique identifier for this bar component */
  id: string;

  /** Which slot this component belongs to */
  slot: LayoutSlot;

  /** React component to render */
  component: ComponentType<P>;

  /** Props to pass to the component */
  props?: P;

  /** Rendering priority (higher = rendered first) */
  priority?: number;

  /** Whether this component should be rendered */
  enabled?: boolean;
}

/**
 * Complete layout configuration
 */
export interface LayoutConfiguration {
  /** Unique layout identifier */
  id: string;

  /** Human-readable layout name */
  name: string;

  /** Bar components for this layout */
  bars: BarComponent[];

  /** Optional metadata */
  metadata?: LayoutMetadata;

  /** Custom CSS class for layout container */
  className?: string;
}

/**
 * Layout registry mapping layout IDs to configurations
 */
export interface LayoutRegistry {
  [layoutId: string]: LayoutConfiguration;
}

/**
 * Layout context state
 */
export interface LayoutContextState {
  /** Currently active layout ID */
  currentLayoutId: string;

  /** Layout registry */
  registry: LayoutRegistry;

  /** Switch to a different layout */
  switchLayout: (layoutId: string) => void;

  /** Get current layout configuration */
  getCurrentLayout: () => LayoutConfiguration | null;

  /** Get bars for a specific slot */
  getBarsForSlot: (slot: LayoutSlot) => BarComponent[];
}

/**
 * Props for LayoutProvider
 */
export interface LayoutProviderProps {
  children: ReactNode;
  initialLayout?: string;
  registry?: LayoutRegistry;
}

/**
 * Props for LayoutSlot component
 */
export interface LayoutSlotProps {
  slot: LayoutSlot;
  components?: BarComponent[];
  fallback?: ReactNode;
  menubarRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Props for base Layout component
 */
export interface LayoutProps {
  children: ReactNode;
  layoutId?: string;
  className?: string;
}
