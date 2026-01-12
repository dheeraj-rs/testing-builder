'use client';
import React, { useRef } from 'react';
import { PanelLeft, PanelTop, PanelBottom, PanelRight } from 'lucide-react';
import { classMixin } from '@/core/utils/class-mixin';
import { useLanguage } from '@/core/providers/LanguageProvider';
import { useLayoutStore } from '@/core/store';

const AppTopbarMenu = () => {
    const layoutConfig = useLayoutStore((state) => state.layoutConfig);
    const layoutState = useLayoutStore((state) => state.layoutState);
    const onMenuToggle = useLayoutStore((state) => state.onMenuToggle);
    const onConfigToggle = useLayoutStore((state) => state.onConfigToggle);
    const onBottombarToggle = useLayoutStore((state) => state.onBottombarToggle);
    const onTopbarToggle = useLayoutStore((state) => state.onTopbarToggle);

    const { t } = useLanguage();
    const menubuttonRef = useRef<HTMLButtonElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);


    return (
        <div
            ref={containerRef}
            className={classMixin('layout-topbar-menu', {
                'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible,
            })}
        >
            <div className="layout-button-container">
                <button ref={menubuttonRef} type="button" className="p-link layout-topbar-button" onClick={onMenuToggle}>
                    <PanelLeft
                        size={24}
                        className={(layoutConfig.menuMode === 'static' && layoutState.staticMenuDesktopInactive === false) || (layoutConfig.menuMode === 'overlay' && layoutState.overlayMenuActive === true) ? 'text-primary' : 'text-color-secondary'}
                        strokeWidth={(layoutConfig.menuMode === 'static' && layoutState.staticMenuDesktopInactive === false) || (layoutConfig.menuMode === 'overlay' && layoutState.overlayMenuActive === true) ? 2.5 : 1.5}
                    />
                    <span>{t('sidebar.collapse')}</span>
                </button>
                <button type="button" className="p-link layout-topbar-button" onClick={onTopbarToggle}>
                    <PanelTop
                        size={24}
                        className={layoutState.topbarAutoHide === false ? 'text-primary' : 'text-color-secondary'}
                        strokeWidth={layoutState.topbarAutoHide === false ? 2.5 : 1.5}
                    />
                    <span>{t('layout.headerStyle')}</span>
                </button>
                <button type="button" className="p-link layout-topbar-button" onClick={onBottombarToggle}>
                    <PanelBottom
                        size={24}
                        className={(layoutConfig.menuMode === 'static' && layoutState.staticBottombarDesktopInactive === false) || (layoutConfig.menuMode === 'overlay' && layoutState.overlayBottombarActive === true) ? 'text-primary' : 'text-color-secondary'}
                        strokeWidth={(layoutConfig.menuMode === 'static' && layoutState.staticBottombarDesktopInactive === false) || (layoutConfig.menuMode === 'overlay' && layoutState.overlayBottombarActive === true) ? 2.5 : 1.5}
                    />
                    <span>{t('layout.footerStyle')}</span>
                </button>
                <button type="button" className="p-link layout-topbar-button" onClick={onConfigToggle}>
                    <PanelRight
                        size={24}
                        className={(layoutConfig.menuMode === 'static' && layoutState.staticConfigDesktopInactive === false) || (layoutConfig.menuMode === 'overlay' && layoutState.overlayConfigActive === true) ? 'text-primary' : 'text-color-secondary'}
                        strokeWidth={(layoutConfig.menuMode === 'static' && layoutState.staticConfigDesktopInactive === false) || (layoutConfig.menuMode === 'overlay' && layoutState.overlayConfigActive === true) ? 2.5 : 1.5}
                    />
                    <span>{t('nav.webconfig')}</span>
                </button>
            </div>
        </div>
    );
};

export default AppTopbarMenu;
