

import { LayoutSectionProps } from '@/core/types/admin-layout';

const TopBar = ({ children }: LayoutSectionProps) => {
    return (
        <nav className="layout__topbar">
            <div className="layout-topbar-main">
                {children}
            </div>
            <div className="layout-topbar-mask" />
        </nav>
    );
};

export default TopBar;
