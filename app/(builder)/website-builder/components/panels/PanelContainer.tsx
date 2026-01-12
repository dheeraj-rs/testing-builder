'use client';

import { type ReactNode } from 'react';
import { AnimatedPanel } from './AnimatedPanel';
import { HistoryPanel } from './HistoryPanel';

export interface PanelContainerProps {
    leftPanel: ReactNode;
    rightPanel: ReactNode;
    showLeftPanel: boolean;
    showRightPanel: boolean;
}

export function PanelContainer({ leftPanel, rightPanel, showLeftPanel, showRightPanel }: PanelContainerProps) {
    // Determine if panels should be full width
    const leftFullWidth = showLeftPanel && !showRightPanel;
    const rightFullWidth = showRightPanel && !showLeftPanel;

    return (
        <div className="flex h-full w-full overflow-hidden relative">
            <AnimatedPanel
                side="left"
                isVisible={showLeftPanel}
                fullWidth={leftFullWidth}
            >
                {leftPanel}
            </AnimatedPanel>

            <AnimatedPanel
                side="right"
                isVisible={showRightPanel}
                fullWidth={rightFullWidth}
                className={showLeftPanel ? 'hidden md:block' : ''}
            >
                {rightPanel}
            </AnimatedPanel>
            <HistoryPanel />
        </div>
    );
}
