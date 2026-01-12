import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { MENU_ITEMS } from '@/core/layouts/constants/menu-data';
import { useTranslatedMenuItems } from '@/core/hooks/useTranslatedMenuItems';
import { AppMenuItem } from '@/core/types/admin-layout';

const BottombarContent = () => {
    const [activeIndex, setActiveIndex] = useState(2);
    const scrollContainerRef = useRef(null);

    // Flatten MENU_ITEMS to get all actionable links
    const flatMenuItems = useMemo(() => {
        const flatten = (items: AppMenuItem[]): AppMenuItem[] => {
            let flat: AppMenuItem[] = [];
            items.forEach(item => {
                if (item.to) {
                    flat.push(item);
                }
                if (item.items) {
                    flat = flat.concat(flatten(item.items));
                }
            });
            return flat;
        };
        const flat = flatten(MENU_ITEMS);
        return flat;
    }, []);

    const translatedMobileMenuItems = useTranslatedMenuItems(flatMenuItems);

    const vibrate = () => {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(30);
        }
    };

    const handleItemClick = (index: number) => {
        setActiveIndex(index);
        vibrate();
    };

    return (
        <React.Fragment>
            <div className="layout-bottombar-desktop" />
            <div className="layout-bottombar-mobile">
                <div ref={scrollContainerRef} className="navigation-scroll-container">
                    {translatedMobileMenuItems.map((item, index) => {
                        const iconClass = typeof item.icon === 'string' ? item.icon : 'pi pi-circle';

                        return (
                            <Link
                                href={item.to || '/dashboard'}
                                key={index}
                                className={`navigation-item ${activeIndex === index ? 'active' : ''}`}
                                onClick={() => handleItemClick(index)}
                            >
                                <div className="icon-wrapper">
                                    <i className={iconClass} style={{ fontSize: '1.2rem' }} />
                                    <span>{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="layout-bottombar-mask" />
        </React.Fragment>
    );
};

export default BottombarContent;
