'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useLayoutStore } from '@/core/store/layoutStore';
import { classNames } from '@/app/(builder)/website-builder/utils/classNames';

function WebsiteBuilderLeftbar() {
    const pathname = usePathname();
    const setLayoutConfig = useLayoutStore((state) => state.setLayoutConfig);

    useEffect(() => {
        setLayoutConfig((prev) => ({ ...prev, menuMode: 'static' }));
    }, [setLayoutConfig]);

    const menuItemsTop: { href: string; label: string; icon: string }[] = [
        { href: '/website-builder', label: 'Chat to Build', icon: 'ph:chat-circle-dots-duotone' },
        { href: '/drag-drop-builder', label: 'Drag to Build', icon: 'ph:hand-grabbing-duotone' },
        { href: '/snippets-websites', label: 'Snippets', icon: 'ph:code-block-duotone' },
    ];

    const menuItemsBottom: { href: string; label: string; icon: string }[] = [
        { href: '/website-builder/publish', label: 'Publish', icon: 'ph:rocket-launch-duotone' },
        { href: '/website-builder/settings', label: 'Settings', icon: 'ph:gear-duotone' },
    ];

    const renderMenuItem = (item: { href: string; label: string; icon: string }) => (
        <li key={item.href}>
            <Link
                href={item.href}
                className={classNames('menu-item', {
                    'active-item': pathname === item.href,
                })}
                title={item.label}
            >
                <Icon icon={item.icon} className="layout-menuitem-icon" />
                <span className="layout-menuitem-text">{item.label}</span>
            </Link>
        </li>
    );

    return (
        <div className="builder-leftbar-custom">
            <ul className="layout-menu menu-top">
                {menuItemsTop.map(renderMenuItem)}
            </ul>
            <ul className="layout-menu menu-bottom">
                {menuItemsBottom.map(renderMenuItem)}
            </ul>
        </div>
    );
}

export default WebsiteBuilderLeftbar;