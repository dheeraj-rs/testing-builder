import { LayoutConfig, LayoutState } from '@/core/types/admin-layout';
import { PanelLeft, PanelTop, PanelBottom, PanelRight, Maximize, Minimize } from 'lucide-react';

interface TabConfigProps {
    layoutConfig: LayoutConfig;
    layoutState: LayoutState;
    isFullscreen: boolean;
    onMenuToggle: () => void;
    onTopbarToggle: () => void;
    onBottombarToggle: () => void;
    onConfigToggle: () => void;
    toggleFullscreen: () => void;
    t: (key: string) => string;
}

const TabConfig = ({
    layoutConfig,
    layoutState,
    isFullscreen,
    onMenuToggle,
    onTopbarToggle,
    onBottombarToggle,
    onConfigToggle,
    toggleFullscreen,
    t,
}: TabConfigProps) => {
    // Helper to determine active state
    const isMenuActive = (layoutConfig.menuMode === 'static' && layoutState.staticMenuDesktopInactive === false) ||
        (layoutConfig.menuMode === 'overlay' && layoutState.overlayMenuActive === true) ||
        layoutState.staticMenuMobileActive === true;

    const isTopbarActive = !layoutState.topbarAutoHide;

    const isBottombarActive = (layoutConfig.menuMode === 'static' && layoutState.staticBottombarDesktopInactive === false) ||
        (layoutConfig.menuMode === 'overlay' && layoutState.overlayBottombarActive === true);

    const isConfigActive = (layoutConfig.menuMode === 'static' && !layoutState.staticConfigDesktopInactive) ||
        (layoutConfig.menuMode === 'overlay' && layoutState.overlayConfigActive);

    const getIconClass = (isActive: boolean) => isActive ? 'text-primary' : 'text-color-secondary';
    const getStrokeWidth = (isActive: boolean) => isActive ? 2.5 : 1.5;

    return (
        <>
            <h5 className="config-title">{t('config.tabConfig')}</h5>
            <div className="config-tab-toggle">
                <button type="button" className="p-link toggle-button" onClick={onMenuToggle}>
                    <PanelLeft size={24} className={getIconClass(isMenuActive)} strokeWidth={getStrokeWidth(isMenuActive)} />
                    <span>{t('config.menu')}</span>
                </button>
                <button type="button" className="p-link toggle-button" onClick={onTopbarToggle}>
                    <PanelTop size={24} className={getIconClass(isTopbarActive)} strokeWidth={getStrokeWidth(isTopbarActive)} />
                    <span>{t('config.header')}</span>
                </button>
                <button type="button" className="p-link toggle-button" onClick={onBottombarToggle}>
                    <PanelBottom size={24} className={getIconClass(isBottombarActive)} strokeWidth={getStrokeWidth(isBottombarActive)} />
                    <span>{t('config.footer')}</span>
                </button>
                <button type="button" className="p-link toggle-button" onClick={onConfigToggle}>
                    <PanelRight size={24} className={getIconClass(isConfigActive)} strokeWidth={getStrokeWidth(isConfigActive)} />
                    <span>{t('config.config')}</span>
                </button>
                <button type="button" className={`p-link toggle-button ${isFullscreen && 'active'}`} onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                    <span>{isFullscreen ? t('config.appModeActive') : t('config.appMode')}</span>
                </button>
            </div>
        </>
    );
};

export default TabConfig;
