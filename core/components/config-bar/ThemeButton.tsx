'use client';

import { classMixin } from '@/core/utils/class-mixin';
import { useTheme } from '@/core/providers/ThemeProvider';
import { ThemeButtonProps } from '@/core/types/admin-layout';

export const ThemeButton = ({
    theme,
    colorScheme,
    name,
    primary,
    secondary,
}: ThemeButtonProps) => {
    const { layoutConfig, changeTheme } = useTheme();

    return (
        <div
            key={`${name}-${colorScheme}`}
            onClick={() => changeTheme(theme, colorScheme)}
            className={classMixin('theme-selector__grid-item', {
                selected: layoutConfig.theme === theme,
            })}
            style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
            }}
            role="button"
            aria-label={`${name} theme`}
        >
            <div className="theme-selector__grid-item-content">
                <div className="theme-selector__grid-item-content-top">
                    <div className={`color-dot ${colorScheme}`} />
                    {layoutConfig.theme === theme && <i className="pi pi-check selected-icon" />}
                </div>
                <div className="theme-selector__grid-item-content-bottom">
                    <p>{name}</p>
                </div>
            </div>
        </div>
    );
};