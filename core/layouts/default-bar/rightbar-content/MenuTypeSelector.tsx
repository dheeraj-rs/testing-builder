import { useEffect, useState, useCallback, useRef } from 'react';
import { classMixin } from '../../../utils/class-mixin';
import { MenuTypeSelectorProps } from '@/core/types/admin-layout';

const MenuTypeSelector = ({
    layoutConfig,
    layoutState,
    changeMenuMode,
    onSidebarAutoOverlayToggle,
    t,
}: MenuTypeSelectorProps) => {
    const [isMobile, setIsMobile] = useState(false);
    const changeMenuModeRef = useRef(changeMenuMode);

    useEffect(() => {
        changeMenuModeRef.current = changeMenuMode;
    }, [changeMenuMode]);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 991;
            setIsMobile(mobile);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [layoutConfig.menuMode]);

    const handleStaticClick = useCallback(() => {
        changeMenuMode({ value: 'static' });
    }, [changeMenuMode]);

    const handleOverlayClick = useCallback(() => {
        changeMenuMode({ value: 'overlay' });
    }, [changeMenuMode]);

    return (
        <>
            <h5 className="config-title">{t('config.menuType')}</h5>
            <div className="menu-type-selector">
                {!isMobile && (
                    <button
                        type="button"
                        className={`menu-type-btn ${layoutConfig.menuMode === 'static' ? 'active' : ''}`}
                        onClick={handleStaticClick}
                        title={t('config.static')}
                    >
                        <i className="pi pi-lock" />
                        <span>{t('config.static')}</span>
                    </button>
                )}
                <button
                    type="button"
                    className={`menu-type-btn ${layoutConfig.menuMode === 'overlay' ? 'active' : ''}`}
                    onClick={handleOverlayClick}
                    title={t('config.overlay')}
                >
                    <i className="pi pi-bars" />
                    <span>{t('config.overlay')}</span>
                </button>
            </div>

            {layoutConfig.menuMode === 'static' && !isMobile && (
                <>
                    <h5 className="config-title">{t('config.menuMode')}</h5>
                    <div className="menu-mode-selector">
                        <button
                            type="button"
                            className={classMixin('mode-button', {
                                active: !layoutState.sidebarAutoOverlayActive,
                            })}
                            onClick={onSidebarAutoOverlayToggle}
                        >
                            <i className="pi pi-arrows-alt" />
                            <span>{t('config.default')}</span>
                        </button>
                        <button
                            type="button"
                            className={classMixin('mode-button', {
                                active: layoutState.sidebarAutoOverlayActive,
                            })}
                            onClick={onSidebarAutoOverlayToggle}
                        >
                            <i className="pi pi-sync" />
                            <span>{t('config.auto')}</span>
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

export default MenuTypeSelector;
