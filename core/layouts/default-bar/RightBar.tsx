import { forwardRef } from 'react';

import { LayoutSectionProps } from '@/core/types/admin-layout';

const RightBar = forwardRef<HTMLDivElement, LayoutSectionProps>(({ children }, ref) => {
    return <aside className="layout__config" ref={ref}>{children}</aside>;
});

RightBar.displayName = 'RightBar';

export default RightBar;
