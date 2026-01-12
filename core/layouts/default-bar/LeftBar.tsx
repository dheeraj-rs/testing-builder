import { forwardRef } from 'react';

import { LayoutSectionProps } from '@/core/types/admin-layout';

const LeftBar = forwardRef<HTMLDivElement, LayoutSectionProps>(({ children }, ref) => {
    return <aside className="layout__sidebar" ref={ref}>{children}</aside>;
});

LeftBar.displayName = 'LeftBar';

export default LeftBar;
