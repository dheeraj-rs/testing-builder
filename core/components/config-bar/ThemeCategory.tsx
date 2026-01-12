'use client';

import { ThemeButton } from './ThemeButton';
import { Theme } from '@/core/types/admin-layout';
import { memo } from 'react';
export const ThemeCategory = memo(({ title, themes }: { title: string; themes: Theme[] }) => {
    return (
        <div className="theme-category">
            <h6>{title}</h6>
            <div className="theme-grid">
                {themes.map((theme: Theme) => (
                    <ThemeButton key={theme.theme} {...theme} />
                ))}
            </div>
        </div>
    );
});

ThemeCategory.displayName = 'ThemeCategory';
