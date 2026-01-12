'use client';
import { useRef } from 'react';
import { ChildContainerProps, LayoutContentProps } from '@/core/types/admin-layout';
import TopBar from './default-bar/TopBar';
import LeftBar from './default-bar/LeftBar';
import RightBar from './default-bar/RightBar';
import BottomBar from './default-bar/BottomBar';
import { useLayoutStore } from '../store';
import { useMenuManagement } from '../hooks/useMenuManagement';
import { useLayoutClasses } from '../hooks/useLayoutClasses';
import ContentArea from './default-bar/ContentArea';
import LayoutMask from './default-bar/LayoutMask';
import TopbarContent from './default-bar/topbar-content/TopbarContent';
import LeftbarContent from './default-bar/leftbar-content/LeftbarContent';
import RightbarContent from './default-bar/rightbar-content/RightbarContent';
import BottombarContent from './default-bar/bottombar-content/BottombarContent';

interface LayoutProps extends ChildContainerProps, LayoutContentProps { }

const Layout = ({
    children,
    topbarContent,
    leftbarContent,
    rightbarContent,
    bottombarContent
}: LayoutProps) => {
    const layoutConfig = useLayoutStore((state) => state.layoutConfig);
    const layoutState = useLayoutStore((state) => state.layoutState);
    const setLayoutState = useLayoutStore((state) => state.setLayoutState);

    const menubarRef = useRef<HTMLDivElement>(null);
    const configbarRef = useRef<HTMLDivElement>(null);
    const bottombarRef = useRef<HTMLDivElement>(null);

    useMenuManagement({
        layoutState,
        setLayoutState,
        menubarRef,
        configbarRef,
    });

    const containerClass = useLayoutClasses({ layoutConfig, layoutState });

    return (
        <div className={containerClass}>
            <TopBar>
                {topbarContent !== undefined ? topbarContent : <TopbarContent />}
            </TopBar>

            <LeftBar ref={menubarRef}>
                {leftbarContent !== undefined ? leftbarContent : <LeftbarContent menubarRef={menubarRef} />}
            </LeftBar>

            <RightBar ref={configbarRef}>
                {rightbarContent !== undefined ? rightbarContent : <RightbarContent />}
            </RightBar>

            <ContentArea>
                {children}
            </ContentArea>

            <BottomBar ref={bottombarRef}>
                {bottombarContent !== undefined ? bottombarContent : <BottombarContent />}
            </BottomBar>
            <LayoutMask />
        </div>
    );
};

export default Layout;
