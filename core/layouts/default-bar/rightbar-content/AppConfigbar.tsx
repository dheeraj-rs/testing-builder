'use client';

import { ThemeManager } from '@/core/utils/theme/ThemeManager';
import { useEffect, useState } from 'react';
import { LayoutConfig } from '../../../store';
import { useLayoutStore } from '../../../store';
import { useLanguage, AVAILABLE_LANGUAGES } from '@/core/providers/LanguageProvider';
import ScaleControl from './ScaleControl';
import MenuTypeSelector from './MenuTypeSelector';
import TabConfig from './TabConfig';
import { ThemeButton } from '@/core/components/config-bar/ThemeButton';

const AppConfigbar = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { t } = useLanguage();
    const [scales] = useState([11, 12, 13, 14, 15]);

    const layoutConfig = useLayoutStore((state) => state.layoutConfig);
    const setLayoutConfig = useLayoutStore((state) => state.setLayoutConfig);
    const layoutState = useLayoutStore((state) => state.layoutState);
    const language = useLayoutStore((state) => state.language);
    const setLanguage = useLayoutStore((state) => state.setLanguage);
    const onSidebarAutoOverlayToggle = useLayoutStore((state) => state.onSidebarAutoOverlayToggle);
    const onMenuToggle = useLayoutStore((state) => state.onMenuToggle);
    const onConfigToggle = useLayoutStore((state) => state.onConfigToggle);
    const onBottombarToggle = useLayoutStore((state) => state.onBottombarToggle);
    const onTopbarToggle = useLayoutStore((state) => state.onTopbarToggle);

    const changeRipple = (e: { value: boolean }) => {
        ThemeManager.ripple = e.value;
        setLayoutConfig((prevState: LayoutConfig) => ({
            ...prevState,
            ripple: e.value,
        }));
    };

    const changeMenuMode = (e: { value: string }) => {
        setLayoutConfig((prevState: LayoutConfig) => ({
            ...prevState,
            menuMode: e.value as 'static' | 'overlay',
        }));
    };



    useEffect(() => {
        document.documentElement.style.fontSize = layoutConfig.scale + 'px';
    }, [layoutConfig.scale]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);

            document.body.style.overflow = 'hidden';
            document.documentElement.style.background = 'var(--d-admin-bg-color)';
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);

            document.body.style.overflow = '';
            document.documentElement.style.background = '';
        }
    };

    return (
        <div className="layout-config-container">
            <ScaleControl layoutConfig={layoutConfig} setLayoutConfig={setLayoutConfig} scales={scales} t={t} />

            <MenuTypeSelector
                layoutConfig={layoutConfig}
                layoutState={layoutState}
                changeMenuMode={changeMenuMode}
                onSidebarAutoOverlayToggle={onSidebarAutoOverlayToggle}
                t={t}
            />

            <TabConfig
                layoutConfig={layoutConfig}
                layoutState={layoutState}
                isFullscreen={isFullscreen}
                onMenuToggle={onMenuToggle}
                onTopbarToggle={onTopbarToggle}
                onBottombarToggle={onBottombarToggle}
                onConfigToggle={onConfigToggle}
                toggleFullscreen={toggleFullscreen}
                t={t}
            />

            <h5 className="config-title">{t('config.rippleEffect')} <span className=''>{t('config.language')}</span></h5>
            <div className="ripple-language-row">
                <div className="ripple-toggle">
                    <button
                        className={`toggle-button ${layoutConfig.ripple ? 'active' : ''}`}
                        onClick={() => changeRipple({ value: !layoutConfig.ripple })}
                        title={`Toggle ${t('config.rippleEffect')}`}
                    >
                        <i className="pi pi-circle-fill ripple-icon" />
                        <span>{t('config.ripple')}</span>
                    </button>
                    <select
                        className="language-dropdown"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                    >
                        {AVAILABLE_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.flag} {lang.nativeName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="theme-container">
                <h5 className="config-title">{t('config.themes')}</h5>
                <div className="theme-grid">
                    <ThemeButton
                        theme="md-light-indigo"
                        colorScheme="light"
                        name={t('config.mdLightIndigo')}
                        primary="#3f51b5"
                        secondary="#ffffff"
                    />
                    <ThemeButton
                        theme="mdc-dark-indigo"
                        colorScheme="dark"
                        name={t('config.mdDarkIndigo')}
                        primary="#3f51b5"
                        secondary="#212529"
                    />
                    <ThemeButton
                        theme="d-admin-light"
                        colorScheme="light"
                        name={t('config.dAdminLight')}
                        primary="#6366f1"
                        secondary="#ffffff"
                    />
                    <ThemeButton
                        theme="d-admin-dark"
                        colorScheme="dark"
                        name={t('config.dAdminDark')}
                        primary="#6366f1"
                        secondary="#0f172a"
                    />
                </div>
            </div>
        </div >
    );
};

export default AppConfigbar;