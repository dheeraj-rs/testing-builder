import { forwardRef } from 'react';

import { LayoutSectionProps } from '@/core/types/admin-layout';

const BottomBar = forwardRef<HTMLDivElement, LayoutSectionProps>(({ children }, ref) => {
    return (
        <footer className="layout__bottombar" ref={ref}>
            {children}
            <div className="layout-bottombar-mask" />
        </footer>
    );
});

BottomBar.displayName = 'BottomBar';

export default BottomBar;
