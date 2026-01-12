export type ListenerType = (e: Event) => void;

export interface UseEventListenerProps {
  type: string;
  listener: ListenerType;
  options?: boolean | AddEventListenerOptions;
}
