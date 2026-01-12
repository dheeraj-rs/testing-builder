'use client';
import React, { useCallback, useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppMenuItem, AppMenuItemProps } from '@/core/types/admin-layout';
import { useMenuStore } from '@/core/store';
import { classMixin } from '@/core/utils/class-mixin';

const AppMenuitemInner = (props: AppMenuItemProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeMenu = useMenuStore((state) => state.activeMenu);
    const setActiveMenu = useMenuStore((state) => state.setActiveMenu);

    const item = props.item;
    const key = props.parentKey ? props.parentKey + '-' + props.index : String(props.index);
    const isActiveRoute =
        item!.to && (pathname === item!.to || (pathname.startsWith(item!.to) && item!.to !== '/' && pathname.charAt(item!.to.length) === '/'));
    const active = activeMenu === key || activeMenu.startsWith(key + '-');

    // Initialize isOpen: root items are always open, nested items open if active
    const [isOpen, setIsOpen] = useState(() => props.root ? true : (active && !!item!.items));

    const onRouteChange = useCallback(
        (url: string) => {
            if (item!.to && item!.to === url && activeMenu !== key) {
                setActiveMenu(key);
            }
        },
        [item, key, setActiveMenu, activeMenu]
    );

    useEffect(() => {
        onRouteChange(pathname);
    }, [pathname, searchParams, onRouteChange]);

    const itemClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (item!.disabled) {
            event.stopPropagation();
            event.preventDefault();
            return;
        }
        if (item!.command) {
            item!.command({ originalEvent: event, item: item! });
        }
        if (item!.items) {
            // Toggle submenu (but not for root items - they stay open)
            if (!props.root) {
                event.preventDefault();
                setIsOpen(!isOpen);
            }
            setActiveMenu(key);
        } else {
            setActiveMenu(key);
        }
    };

    const subMenu = item!.items && item!.visible !== false && (
        <ul className={classMixin('layout-submenu', { 'submenu-open': isOpen, 'submenu-closed': !isOpen })}>
            {item!.items.map((child: AppMenuItem, i: number) => {
                return <AppMenuitem item={child} index={i} className={child.badgeClass} parentKey={key} key={child.label} />;
            })}
        </ul>
    );

    return (
        <li
            className={classMixin({
                'layout-root-menuitem': !!props.root,
                'active-menuitem': active,
            })}
        >
            {props.root && item!.visible !== false && (
                <>
                    {<div className="layout-menuitem-root-text">{item!.label}</div>}
                    {<div className="separator-line" />}
                </>
            )}
            {(!item!.to || item!.items) && item!.visible !== false ? (
                <a href={item!.url} onClick={(e) => itemClick(e)} className={classMixin(item!.class, 'p-ripple')} target={item!.target} tabIndex={0}>
                    <i className={classMixin('layout-menuitem-icon', item!.icon)}></i>
                    <span className="layout-menuitem-text">{item!.label}</span>
                    {item!.items && <i className={classMixin('pi pi-fw layout-submenu-toggler', { 'pi-angle-down': !isOpen, 'pi-angle-up': isOpen })}></i>}
                </a>
            ) : null}
            {item!.to && !item!.items && item!.visible !== false ? (
                <Link
                    href={item!.to}
                    replace={item!.replaceUrl}
                    target={item!.target}
                    onClick={(e) => itemClick(e)}
                    className={classMixin(item!.class, 'p-ripple', { 'active-route': !!isActiveRoute })}
                    tabIndex={0}
                >
                    <i className={classMixin('layout-menuitem-icon', item!.icon)}></i>
                    <span className="layout-menuitem-text">{item!.label}</span>
                </Link>
            ) : null}
            {subMenu}
        </li>
    );
};
const AppMenuitem = (props: AppMenuItemProps) => {
    return (
        <Suspense fallback={<li>Loading...</li>}>
            <AppMenuitemInner {...props} />
        </Suspense>
    );
};

export default AppMenuitem;