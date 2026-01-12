import React, { RefObject, useRef } from 'react';
import AppMenuitem from './AppMenuitem';
import AppMenuSearch from './AppMenuSearch';
import { useLayoutStore } from '@/core/store';
import { useTranslatedMenuItems } from '@/core/hooks/useTranslatedMenuItems';
import { AppMenuItem } from '@/core/types/admin-layout';
import { MENU_ITEMS } from '../../constants/menu-data';

const LeftbarContent = ({ menubarRef }: { menubarRef: React.RefObject<HTMLDivElement | null> }) => {
    const searchRef = useRef<HTMLDivElement>(null);
    const layoutState = useLayoutStore((state) => state.layoutState);
    const filteredMenuItems = useTranslatedMenuItems(MENU_ITEMS);
    const originalItems: AppMenuItem[] = layoutState?.searchSidebarItems?.length
        ? layoutState.searchSidebarItems
        : filteredMenuItems.length > 0
            ? filteredMenuItems
            : MENU_ITEMS;
    const items = useTranslatedMenuItems(originalItems);

    return (
        <ul className="layout-menu">
            {items.map((item, i) => {
                return !item?.separator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
            })}
            <AppMenuSearch searchRef={searchRef as unknown as RefObject<HTMLDivElement>} menubarRef={menubarRef as unknown as RefObject<HTMLDivElement>} />
        </ul>
    );
};

export default LeftbarContent;