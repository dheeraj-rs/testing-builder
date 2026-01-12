import { ReactElement } from 'react';

export interface CSSTransitionProps {
  in: boolean;
  timeout: {
    enter: number;
    exit: number;
  };
  classNames: string;
  children: ReactElement;
  onEnter?: () => void;
  onExit?: () => void;
}
