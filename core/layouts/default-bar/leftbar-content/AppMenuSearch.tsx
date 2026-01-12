import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MENU_ITEMS as menuItems } from '../../constants/menu-data';
import { useEventListener } from '../../../hooks/useEventListener';
import { useLayoutStore, LayoutState } from '../../../store';
import { AppSearchProps, SearchableItem, SearchConfig } from '@/core/types/admin-layout';

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
    maxResults: 10,
    minSearchLength: 1,
    fuzzySearch: false,
    searchMode: 'advanced',
};

const AppMenuSearch = <T extends SearchableItem>({
    searchRef,
    menubarRef,
    type = 'menu',
    items: propItems,
    searchConfig: userSearchConfig,
    placeholder = 'Search items...',
    onSearchResults = () => { },
}: AppSearchProps<T>) => {
    const searchSources = {
        menu: propItems || menuItems,
        pageContent: propItems || [],
    } as const;

    type SearchSourceType = keyof typeof searchSources;
    const items = searchSources[type as SearchSourceType];

    const searchConfig = useMemo(
        () => ({
            ...DEFAULT_SEARCH_CONFIG,
            ...userSearchConfig,
        }),
        [userSearchConfig]
    );

    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState<string>('');
    const setLayoutState = useLayoutStore((state) => state.setLayoutState);
    const setLayoutConfig = useLayoutStore((state) => state.setLayoutConfig);

    const detectSearchableKeys = useCallback((items: T[]): string[] => {
        if (!items?.length) return ['label'];
        const firstItem = items[0];
        return Object.keys(firstItem).filter((key) => typeof firstItem[key] === 'string' || typeof firstItem[key] === 'number');
    }, []);

    const filterItems = useCallback(
        function recursiveFilter(searchItems: T[], term: string): T[] {
            if (!term || term.length < (searchConfig.minSearchLength ?? 1)) return [];
            if (!searchItems?.length) return [];

            const searchableKeys = searchConfig.searchKeys || detectSearchableKeys(searchItems);
            const terms =
                searchConfig.searchMode === 'advanced'
                    ? term
                        .toLowerCase()
                        .match(/"[^"]+"|[^\s]+/g)
                        ?.map((t) => t.replace(/"/g, '')) || []
                    : [term.toLowerCase()];

            return searchItems
                .reduce<T[]>((filtered, item) => {
                    const matchesSearch = terms.every((termPart) => {
                        const fieldSearch = termPart.match(/^(\w+):(.+)$/);
                        if (fieldSearch && searchConfig.searchMode === 'advanced') {
                            const [, field, value] = fieldSearch;
                            return typeof item[field] === 'string' && item[field].toLowerCase().includes(value.toLowerCase());
                        }
                        return searchableKeys.some((key: keyof T) => {
                            const value = item[key];
                            if (value == null) return false;
                            const stringValue = String(value).toLowerCase();
                            if (searchConfig.fuzzySearch) {
                                return termPart.split('').every((char) => stringValue.includes(char.toLowerCase()));
                            }
                            return stringValue.includes(termPart);
                        });
                    });

                    const filteredChildren = item.items ? recursiveFilter(item.items as T[], term) : [];

                    if (matchesSearch || filteredChildren.length > 0) {
                        const newItem = { ...item } as T;
                        if (filteredChildren.length > 0) {
                            newItem.items = filteredChildren;
                        }
                        return [...filtered, newItem];
                    }

                    return filtered;
                }, [])
                .slice(0, searchConfig.maxResults);
        },
        [searchConfig, detectSearchableKeys]
    );
    const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleClear = useCallback(() => {
        setSearchTerm('');
        if (type === 'menu') {
            setLayoutState((prev) => ({
                ...prev,
                searchSidebarItems: [],
            }));
        } else {
            onSearchResults([]);
        }
    }, [type, setLayoutState, onSearchResults]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setSearchTerm(newValue);
            if (clearTimeoutRef.current) {
                clearTimeout(clearTimeoutRef.current);
            }
            const newResults = filterItems(items as T[], newValue);
            if (type === 'menu') {
                setLayoutState((prev) => ({
                    ...prev,
                    searchSidebarItems: newResults as unknown as SearchableItem[],
                }) as LayoutState);
            } else {
                onSearchResults(newResults);
            }
        },
        [items, type, filterItems, setLayoutState, onSearchResults]
    );

    const filteredItems = filterItems(items as T[], searchTerm);

    const hasResults = filteredItems?.length > 0;

    const iconClassName = `pi ${searchTerm && !hasResults ? 'pi-exclamation-triangle' : 'pi-search'}`;

    const iconStyle: React.CSSProperties | undefined = searchTerm && !hasResults ? { color: 'red' } : undefined;

    const [bindSearchOutsideClickListener, unbindSearchOutsideClickListener] = useEventListener({
        type: 'click',
        listener: (event) => {
            const isOutsideClicked = !(
                searchRef?.current?.isSameNode(event.target as Node) ||
                searchRef?.current?.contains(event.target as Node) ||
                menubarRef?.current?.isSameNode(event.target as Node) ||
                menubarRef?.current?.contains(event.target as Node)
            );
            if (isOutsideClicked && searchTerm) {
                handleClear();
            }
        },
    });

    useEffect(() => {
        if (searchTerm) {
            bindSearchOutsideClickListener();
        }
        return () => {
            unbindSearchOutsideClickListener();
        };
    }, [searchTerm, bindSearchOutsideClickListener, unbindSearchOutsideClickListener]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                setLayoutConfig((prev) => ({
                    ...prev,
                    secretKey: searchTerm,
                }));

                const findFirstExactMatchingItem = (items: T[]): T | null => {
                    const normalizedSearch = searchTerm.toLowerCase().trim();
                    if (!normalizedSearch) return null;
                    for (const item of items) {
                        const exactLabelMatch = item.label?.toLowerCase() === normalizedSearch;
                        const exactKeywordMatch = item.keywords?.some((k: string) => k.toLowerCase() === normalizedSearch);
                        const exactDescriptionMatch = item.description?.toLowerCase() === normalizedSearch;
                        if (exactLabelMatch || exactKeywordMatch || exactDescriptionMatch) {
                            return item;
                        }
                        if (Array.isArray(item.items) && item.items.length > 0) {
                            const childMatch = findFirstExactMatchingItem(item.items as T[]);
                            if (childMatch) return childMatch;
                        }
                    }
                    for (const item of items) {
                        const matchesLabel = item.label?.toLowerCase().includes(normalizedSearch);
                        const matchesKeywords = item.keywords?.some((k: string) => k.toLowerCase().includes(normalizedSearch));
                        const matchesDescription = item.description?.toLowerCase().includes(normalizedSearch);
                        if (matchesLabel || matchesKeywords || matchesDescription) {
                            return item;
                        }
                        if (Array.isArray(item.items) && item.items.length > 0) {
                            const childMatch = findFirstExactMatchingItem(item.items as T[]);
                            if (childMatch) return childMatch;
                        }
                    }
                    return null;
                };
                const matchingItem = findFirstExactMatchingItem(filteredItems);
                if (matchingItem?.to || matchingItem?.path) {
                    const navigationPath = (matchingItem.to || matchingItem.path) as string;
                    router.push(navigationPath);
                    handleClear();
                }
            } else if (e.key === 'Escape') {
                handleClear();
            }
        },
        [searchTerm, filteredItems, setLayoutConfig, router, handleClear]
    );

    return (
        <div ref={searchRef} className="layout__searchbar">
            <div className="searchbar-container">
                <input
                    type="text"
                    id="menu-search"
                    name="menu-search"
                    className="searchbar-input"
                    value={searchTerm}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    spellCheck="false"
                    autoComplete="off"
                />
                <div className="icon-container" onClick={handleClear}>
                    <i className={iconClassName} style={iconStyle} />
                </div>
            </div>
        </div>
    );
};

export default AppMenuSearch;