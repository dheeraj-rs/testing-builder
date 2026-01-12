'use client';

import { type ReactNode } from 'react';
import { classNames } from '@/app/(builder)/website-builder/utils/classNames';

export interface AnimatedPanelProps {
    children: ReactNode;
    isVisible: boolean;
    side: 'left' | 'right';
    fullWidth?: boolean;
    className?: string;
}

export function AnimatedPanel({ children, isVisible, side, fullWidth = false, className }: AnimatedPanelProps) {
    return (
        <div
            className={classNames(
                'animated-panel',
                'h-full overflow-hidden',
                'transition-all duration-300 ease-in-out',
                {
                    // Width transitions - responsive
                    'w-0': !isVisible,
                    'w-full': isVisible && fullWidth,
                    'w-full md:w-1/2': isVisible && !fullWidth, // Full width on mobile, 50% on desktop

                    // Opacity transitions
                    'opacity-0 pointer-events-none': !isVisible,
                    'opacity-100': isVisible,

                    // Side-specific styles
                    'border-r border-surface': side === 'left' && isVisible,
                    'border-l border-surface': side === 'right' && isVisible,
                },
                className,
            )}
            data-side={side}
            data-visible={isVisible}
        >
            <div className="h-full w-full overflow-hidden">
                {children}
            </div>
        </div>
    );
}
