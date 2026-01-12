
import React, { forwardRef, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLayoutStore } from '@/core/store';
import { AppTopbarRef } from '@/core/types/admin-layout';
import AppTopbarNotifications from './AppTopbarNotifications';
import AppTopbarMenu from './AppTopbarMenu';

const TopbarContent = forwardRef<AppTopbarRef>(() => {
    const layoutConfig = useLayoutStore((state) => state.layoutConfig);
    const onMenuToggle = useLayoutStore((state) => state.onMenuToggle);
    const onConfigToggle = useLayoutStore((state) => state.onConfigToggle);
    const topbarRef = useRef<HTMLDivElement>(null);
    const configMenuButtonRef = useRef<HTMLButtonElement>(null);
    const sidebarMenuButtonRef = useRef<HTMLButtonElement>(null);


    return (
        <section ref={topbarRef} className="layout-topbar">
            <div className="topbar-start">
                <Link href="/" className="logo-row">
                    <Image
                        src={`/icons/logo-${layoutConfig.colorScheme?.includes('dark') || layoutConfig.theme?.includes('dark') ? 'dark' : 'white'}.svg`}
                        width={40}
                        height={40}
                        alt="logo"
                        className="logo-img"
                        priority
                    />
                    <span className="logo-text">
                        {'D-Admin'.split('').map((letter: string, index: number) => (
                            <span key={index}>{letter}</span>
                        ))}
                    </span>
                </Link>
            </div>

            <div className="topbar-center">
                <AppTopbarNotifications />
            </div>

            <div className="topbar-end">
                <AppTopbarMenu />
            </div>
            <div className="topbar-actions">
                <button ref={configMenuButtonRef} type="button" className="p-link layout-topbar-button layout-topbar-menu-button" onClick={(e) => { e.stopPropagation(); onConfigToggle(); }}>
                    <i className="pi pi-palette" />
                </button>
                <Link href="/settings">
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-cog"></i>
                    </button>
                </Link>
                <button ref={sidebarMenuButtonRef} type="button" className="p-link layout-topbar-button layout-topbar-menu-button" onClick={(e) => { e.stopPropagation(); onMenuToggle(); }}>
                    <i className="pi pi-bars" />
                </button>
            </div>
        </section>
    );
});

TopbarContent.displayName = 'TopbarContent';

export default TopbarContent;
