'use client';

import React, { useEffect, useRef, useState } from 'react';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import ArrowDownIcon from '@heroicons/react/24/outline/ArrowDownIcon';
import ArrowUpIcon from '@heroicons/react/24/outline/ArrowUpIcon';
import CursorArrowRippleIcon from '@heroicons/react/24/outline/CursorArrowRippleIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import ArrowSmallUpIcon from '@heroicons/react/24/outline/ArrowSmallUpIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import ComputerDesktopIcon from '@heroicons/react/24/outline/ComputerDesktopIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { Rocket } from 'lucide-react';

import { Select } from './Select';
import { ImageDialog } from './dialogs/ImageDialog';
import { ButtonDialog } from './dialogs/ButtonDialog';
import { LinkDialog } from './dialogs/LinkDialog';
import { SvgDialog } from './dialogs/SvgDialog';
import { ExportDialog } from './dialogs/ExportDialog';
import { PublishDialog } from './dialogs/PublishDialog';

import { useBuilderState } from '../hooks/useBuilderState';
import { loadTheme, savePage, loadPage } from '../lib/builderApi';
import { debounce, getImageUrl, isEventOnElement, isElementTopHalf } from '../lib/builderUtils';
import { Component, ComponentWithCategories, Theme } from '../types';
import { exportAsHTML, exportAsReactProject } from '../lib/dragDropZip';

import '../styles/builder.css';

const themes: Theme[] = [
    { name: 'Hyper UI', folder: 'hyperui' },
    { name: 'Tailblocks', folder: 'tailblocks' },
    { name: 'Flowrift', folder: 'flowrift' },
    { name: 'Meraki UI', folder: 'meraki-light' },
    { name: 'Preline', folder: 'preline' },
    { name: 'Flowbite', folder: 'flowbite' },
];

interface CategoryProps {
    themeIndex: number;
    category: string;
    components: Component[];
    standaloneServer: boolean;
    onComponentClick: (component: Component) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
}

function Category({ themeIndex, category, components, standaloneServer, onComponentClick, onDragStart, onDragEnd }: CategoryProps) {
    const [show, setShow] = useState(false);

    return (
        <div id={category.toLowerCase()}>
            <div
                onClick={() => setShow((i) => !i)}
                className={`h-12 cursor-pointer bg-(--d-admin-surface-section) text-(--d-admin-text-color) border-b border-(--d-admin-border) last:border-b-0 flex items-center px-2 ${show ? 'shadow-sm' : ''
                    }`}
            >
                <div className="flex-1 flex items-center">
                    <Squares2X2Icon className="h-4 w-4 ml-2 mr-4" />{' '}
                    <h2 className="text-xs uppercase">{category}</h2>
                </div>
                <a className="rotate-animation" style={{ transform: `rotate(${show ? 180 : 0}deg)` }}>
                    <ArrowSmallUpIcon className="h-4 w-4" />
                </a>
            </div>
            {show && (
                <div>
                    {components.map((c: Component, i: number) => (
                        <img
                            key={i}
                            className="cursor-pointer mb-2"
                            src={getImageUrl(standaloneServer, `/builder-elements/${themes[themeIndex].folder}/${c.folder}/preview.png`)}
                            draggable="true"
                            onClick={() => onComponentClick(c)}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('component', `${category}-${i}`);
                                onDragStart();
                            }}
                            onDragEnd={onDragEnd}
                            alt={`${category} component ${i}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface DragDropBuilderProps {
    standaloneServer?: boolean;
}

export default function DragDropBuilder({ standaloneServer = false }: DragDropBuilderProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const moveUpRef = useRef<SVGSVGElement>(null);
    const moveDownRef = useRef<SVGSVGElement>(null);
    const deleteRef = useRef<SVGSVGElement>(null);
    const popoverElementRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<SVGSVGElement>(null);

    const [isPreview, setIsPreview] = useState(false);
    const [hoveredComponent, setHoveredComponent] = useState<HTMLDivElement | null>(null);
    const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
    const [components, setComponents] = useState<ComponentWithCategories>({});
    const [isEmptyCanvas, setIsEmptyCanvas] = useState<boolean>(false);
    const [selectOpen, setSelectOpen] = useState(false);
    const [themeIndex, setThemeIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);

    // Mobile Sidebar State
    // Mobile Sidebar State
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Component Control State
    const [canMoveUp, setCanMoveUp] = useState(false);
    const [canMoveDown, setCanMoveDown] = useState(false);

    const {
        selectedElement,
        setSelectedElement,
        showImageDialog,
        setShowImageDialog,
        showButtonDialog,
        setShowButtonDialog,
        showLinkDialog,
        setShowLinkDialog,
        showSvgDialog,
        setShowSvgDialog,
    } = useBuilderState();

    // Load theme components
    const loadThemeComponents = async (index: number) => {
        try {
            const componentsList = await loadTheme(themes[index].folder, standaloneServer);

            if (!Array.isArray(componentsList)) {
                setError(JSON.stringify(componentsList, null, 2));
                return;
            }
            setError(null);

            const _components = componentsList.reduce((r: ComponentWithCategories, c: Component) => {
                const category = c.folder.replace(/[0-9]/g, '');
                if (!r[category]) r[category] = [];
                r[category].push(c);
                return r;
            }, {});

            setComponents(_components);
        } catch (e: any) {
            setError(e.message);
        }
    };

    // Auto-save on DOM changes
    const onDomChange = () => {
        const config = { attributes: true, childList: true, subtree: true, characterData: true };
        const observer = new MutationObserver(
            debounce(() => {
                console.log('dom changed');
                const html = canvasRef.current!.innerHTML;
                if (html) savePage(html, standaloneServer);
            })
        );
        observer.observe(canvasRef.current!, config);
        return observer;
    };

    // Initialize: load page
    useEffect(() => {
        loadPage(standaloneServer).then((html) => (canvasRef.current!.innerHTML = html));
        const observer = onDomChange();
        return () => observer.disconnect();
    }, []);

    // Load theme components when themeIndex changes
    useEffect(() => {
        loadThemeComponents(themeIndex);
    }, [themeIndex]);

    // Clear all components
    const clearComponents = async () => {
        canvasRef.current!.innerHTML = '';
    };

    // Get all components from canvas
    const getComponents = (): HTMLDivElement[] => {
        return Array.from(canvasRef.current?.children ?? []).filter(
            (c) => c.tagName !== 'SCRIPT'
        ) as HTMLDivElement[];
    };

    // Handle component drop
    const onCanvasDrop = async (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();

        const [categoryId, componentId] = e.dataTransfer!.getData('component').split('-');
        const component: Component = components[categoryId][componentId as unknown as number];
        const html = component.source;

        const _components = getComponents();
        if (_components.length === 0) {
            canvasRef.current!.innerHTML = html;
        } else if (hoveredComponent && isElementTopHalf(hoveredComponent!, e)) {
            hoveredComponent!.insertAdjacentHTML('beforebegin', html);
        } else if (hoveredComponent && !isElementTopHalf(hoveredComponent!, e)) {
            hoveredComponent!.insertAdjacentHTML('afterend', html);
        }

        removeBorders();
        setHoveredComponent(null);
        setIsEmptyCanvas(false);
        // Close mobile sidebar on drop if needed, but dragging usually implies visibility
    };

    // Handle mouse over canvas
    const onCanvasMouseOver = (e: React.MouseEvent<HTMLElement>) => {
        if (!popoverRef.current) return;

        const target = e.target as HTMLElement;
        if (target.tagName === 'A') {
            setHoveredElement(target);
            popoverElementRef.current!.style.top = `${target.offsetTop}px`;
            popoverElementRef.current!.style.left = `${target.offsetLeft}px`;
        } else if (target.tagName === 'BUTTON') {
            setHoveredElement(target);
            popoverElementRef.current!.style.top = `${target.offsetTop}px`;
            popoverElementRef.current!.style.left = `${target.offsetLeft}px`;
        }

        // Get hovered component
        const components = getComponents();
        const component = components.find((c) => c.matches(':hover'))!;
        if (!component) return;

        // Update hovered component
        setHoveredComponent(component);
        popoverRef.current.style.top = `${component.offsetTop}px`;
        popoverRef.current.style.left = `${component.offsetLeft}px`;

        // Update component control state
        const index = components.indexOf(component);
        setCanMoveUp(index > 0);
        setCanMoveDown(index < components.length - 1);
    };

    // Handle mouse leave canvas
    const onCanvasMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
        if (!isEventOnElement(popoverRef.current!, e)) {
            setHoveredComponent(null);
        }
    };

    // Handle mouse out canvas
    const onCanvasMouseOut = (e: React.MouseEvent<HTMLElement>) => {
        if (!isEventOnElement(popoverElementRef.current!, e)) {
            setHoveredElement(null);
        }
    };

    // Handle canvas click
    const onCanvasClickCapture = (e: React.MouseEvent<HTMLElement>) => {
        if (isPreview) return;

        e.preventDefault();
        e.stopPropagation();

        const target = e.target as HTMLElement;
        setSelectedElement(target);

        // Handle element clicks
        if (target.tagName === 'IMG') {
            setShowImageDialog(true);
        } else if (target.tagName === 'path') {
            setShowSvgDialog(true);
        } else if (target.tagName === 'svg') {
            setShowSvgDialog(true);
        }

        // Handle popover clicks
        // Handle popover clicks
        if (isEventOnElement(deleteRef.current, e)) {
            const clickEvent = new MouseEvent('click', { bubbles: true });
            deleteRef.current!.dispatchEvent(clickEvent);
        } else if (isEventOnElement(moveUpRef.current, e)) {
            const clickEvent = new MouseEvent('click', { bubbles: true });
            moveUpRef.current!.dispatchEvent(clickEvent);
        } else if (isEventOnElement(moveDownRef.current, e)) {
            const clickEvent = new MouseEvent('click', { bubbles: true });
            moveDownRef.current!.dispatchEvent(clickEvent);
        }
    };

    // Component actions
    const onComponentDelete = () => {
        canvasRef.current!.removeChild(hoveredComponent!);
        setHoveredComponent(null);
    };

    const onComponentMoveUp = () => {
        canvasRef.current!.insertBefore(hoveredComponent!, hoveredComponent!.previousElementSibling);
        setHoveredComponent(null);
    };

    const onComponentMoveDown = () => {
        canvasRef.current!.insertBefore(hoveredComponent!.nextElementSibling!, hoveredComponent);
        setHoveredComponent(null);
    };

    // Handle drag over
    const onCanvasDragOver = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();

        // Update empty flag
        const components = getComponents();
        const isEmpty = components.length === 0;
        if (isEmpty !== isEmptyCanvas) setIsEmptyCanvas(isEmpty);

        // Get hovered component
        if (components.length === 0) return;
        const componentWithEvent = components.find((c) => isEventOnElement(c, e))!;
        const component = componentWithEvent ?? components[components.length - 1];

        // Update border
        const isTopHalf = isElementTopHalf(component, e);
        component.style.setProperty(
            'box-shadow',
            isTopHalf ? ' 0px 6px 0px -2px cornflowerblue inset' : '0px -6px 0px -2px cornflowerblue inset'
        );

        // Update hovered component
        if (!component.isEqualNode(hoveredComponent)) {
            setHoveredComponent(component);
        }
    };

    // Remove borders
    const removeBorders = () => {
        const components = getComponents();
        components.forEach((c: HTMLDivElement) => {
            c.style.setProperty('box-shadow', '');
        });
    };

    // Handle drag leave
    const onCanvasDragLeave = (e: React.DragEvent<HTMLElement>) => {
        if (!canvasRef.current?.contains(e.relatedTarget as HTMLElement)) {
            setHoveredComponent(null);
            removeBorders();
        }
        setIsEmptyCanvas(false);
    };

    // Add Component to Canvas (Tap to Add)
    const addComponentToCanvas = (component: Component) => {
        const html = component.source;
        canvasRef.current!.insertAdjacentHTML('beforeend', html);
        savePage(canvasRef.current!.innerHTML, standaloneServer);
        // Automatically close mobile sidebar for better UX
        setMobileSidebarOpen(false);
    };

    return (
        <div className="flex flex-row bg-(--d-admin-surface-ground) text-(--d-admin-text-color) rounded-lg relative overflow-hidden h-screen">
            {/* Sidebar */}

            {/* Sidebar */}
            {!isPreview && (
                <div
                    className={`
                        absolute inset-y-0 left-0 z-50 w-64 bg-(--d-admin-surface-ground) shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-56 md:shadow-none p-4 md:p-2 shrink-0 overflow-y-scroll h-full
                        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    {/* Mobile Close Button */}
                    <div className="md:hidden flex justify-end mb-4">
                        <button
                            onClick={() => setMobileSidebarOpen(false)}
                            className="p-1 rounded-md hover:bg-(--d-admin-surface-hover)"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {Object.keys(components).map((c: string, i) => (
                        <Category
                            key={i}
                            category={c}
                            themeIndex={themeIndex}
                            components={components[c]}
                            standaloneServer={standaloneServer}
                            onComponentClick={addComponentToCanvas}
                            onDragStart={() => setIsDragging(true)}
                            onDragEnd={() => setIsDragging(false)}
                        />
                    ))}
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && !isPreview && (
                <div
                    className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isDragging ? 'opacity-0 pointer-events-none' : 'bg-(--d-admin-maskbg)'}`}
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="w-full h-screen flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center m-2 p-2 bg-(--d-admin-surface-section) text-(--d-admin-text-color) rounded-md shadow-sm gap-2 flex-wrap">
                    {!isPreview && (
                        <div className="flex items-center gap-2 mr-auto">
                            {/* Mobile Toggle Button */}
                            <button
                                className="md:hidden p-2 rounded-md hover:bg-(--d-admin-surface-hover)"
                                onClick={() => setMobileSidebarOpen(true)}
                            >
                                <Bars3Icon className="h-6 w-6" />
                            </button>

                            <div className="flex items-center">
                                <Select
                                    trigger={
                                        <div
                                            className="flex rounded py-1 px-2 transition cursor-pointer items-center justify-center whitespace-nowrap"
                                        >
                                            <span className="text-xs sm:text-base">{themes[themeIndex].name}</span>
                                            <ChevronDownIcon className="h-3 w-3 ml-1" />
                                        </div>
                                    }
                                    defaultValue={themes[themeIndex].name}
                                    values={themes.map((c) => c.name)}
                                    open={selectOpen}
                                    setOpen={setSelectOpen}
                                    onChange={(e) => {
                                        const index = themes.findIndex((r) => r.name === e);
                                        loadThemeComponents(index).then(() => setThemeIndex(index));
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                        {!isPreview ? (
                            <button
                                className="bg-(--d-admin-green-500) hover:bg-(--d-admin-green-700) text-(--d-admin-text-color) px-3 py-1.5 rounded-md flex items-center text-sm"
                                onClick={() => setIsPreview((s) => !s)}
                            >
                                <ComputerDesktopIcon className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Preview</span>
                            </button>
                        ) : (
                            <button
                                className="bg-(--d-admin-blue-600) hover:bg-(--d-admin-blue-700) text-(--d-admin-text-color) px-3 py-1.5 rounded-md flex items-center text-sm ml-auto"
                                onClick={() => setIsPreview((s) => !s)}
                            >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Editor</span>
                            </button>
                        )}

                        <button
                            className="bg-(--d-admin-primary-600) hover:bg-(--d-admin-primary-600) text-(--d-admin-text-color) px-3 py-1.5 rounded-md flex items-center text-sm"
                            onClick={() => setShowExportDialog(true)}
                        >
                            <ArrowDownIcon className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Export</span>
                        </button>

                        <button
                            className="bg-(--d-admin-blue-600) hover:bg-(--d-admin-blue-700) text-(--d-admin-text-color) px-3 py-1.5 rounded-md flex items-center text-sm"
                            onClick={() => {
                                // Save current HTML to localStorage before showing dialog
                                if (canvasRef.current) {
                                    const html = canvasRef.current.innerHTML;
                                    localStorage.setItem('drag-drop-builder-html', html);
                                }
                                setShowPublishDialog(true);
                            }}
                        >
                            <Rocket className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Publish</span>
                        </button>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-(--d-admin-red-50) border border-(--d-admin-red-500) text-(--d-admin-red-600) px-4 py-3 rounded relative m-2 mx-4" role="alert">
                        <strong className="font-bold">Error loading themes: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Canvas Area */}
                <div className="flex justify-center h-full bg-(--d-admin-surface-section) overflow-y-scroll relative pb-20">
                    {/* Dialogs */}
                    <ImageDialog
                        isOpen={showImageDialog}
                        onClose={() => setShowImageDialog(false)}
                        element={selectedElement as HTMLImageElement}
                        standaloneServer={standaloneServer}
                    />
                    <ButtonDialog
                        isOpen={showButtonDialog}
                        onClose={() => setShowButtonDialog(false)}
                        element={selectedElement as HTMLButtonElement}
                    />
                    <LinkDialog
                        isOpen={showLinkDialog}
                        onClose={() => setShowLinkDialog(false)}
                        element={selectedElement as HTMLAnchorElement}
                    />
                    <SvgDialog
                        isOpen={showSvgDialog}
                        onClose={() => setShowSvgDialog(false)}
                        element={selectedElement as unknown as SVGElement}
                    />
                    <ExportDialog
                        isOpen={showExportDialog}
                        onClose={() => setShowExportDialog(false)}
                        onExportHTML={() => {
                            if (canvasRef.current) {
                                exportAsHTML(canvasRef.current.innerHTML);
                            }
                        }}
                        onExportReact={() => {
                            if (canvasRef.current) {
                                exportAsReactProject(canvasRef.current.innerHTML);
                            }
                        }}
                    />
                    <PublishDialog
                        isOpen={showPublishDialog}
                        onClose={() => setShowPublishDialog(false)}
                        onPublishHTML={() => {
                            localStorage.setItem('drag-drop-builder-format', 'html');
                            window.location.href = '/drag-drop-builder/publish';
                        }}
                        onPublishReact={() => {
                            localStorage.setItem('drag-drop-builder-format', 'react');
                            window.location.href = '/drag-drop-builder/publish';
                        }}
                    />

                    {/* Element Popover (for links and buttons) */}
                    {!isPreview && (
                        <div
                            ref={popoverElementRef}
                            className="absolute z-10-none bg-gray-500"
                            style={{ display: hoveredElement ? 'block' : 'none' }}
                        >
                            <div className="flex flex-row p-1">
                                <CursorArrowRippleIcon
                                    ref={optionsRef}
                                    onClick={() => {
                                        setSelectedElement(hoveredElement);
                                        if (hoveredElement?.tagName === 'BUTTON') {
                                            setShowButtonDialog(true);
                                        } else if (hoveredElement?.tagName === 'A') {
                                            setShowLinkDialog(true);
                                        }
                                    }}
                                    className="h-7 w-7 text-(--d-admin-text-color) p-1 cursor-pointer"
                                />
                            </div>
                        </div>
                    )}

                    {/* Component Popover (for move up/down/delete) */}
                    {!isPreview && (
                        <div
                            ref={popoverRef}
                            onMouseLeave={(e: any) => {
                                if (!canvasRef.current?.isSameNode(e.target)) {
                                    setHoveredComponent(null);
                                }
                            }}
                            className="absolute z-10-none bg-gray-500"
                            style={{ display: hoveredComponent ? 'block' : 'none' }}
                        >
                            <div className="flex flex-row p-1">
                                {canMoveDown && (
                                    <ArrowDownIcon
                                        ref={moveDownRef}
                                        onClick={onComponentMoveDown}
                                        className="h-7 w-7 text-(--d-admin-text-color) p-1 cursor-pointer"
                                    />
                                )}
                                {canMoveUp && (
                                    <ArrowUpIcon
                                        ref={moveUpRef}
                                        onClick={onComponentMoveUp}
                                        className="h-7 w-7 text-(--d-admin-text-color) p-1 cursor-pointer"
                                    />
                                )}
                                <TrashIcon
                                    id="delete"
                                    ref={deleteRef}
                                    onClick={onComponentDelete}
                                    className="h-7 w-7 text-(--d-admin-text-color) p-1 cursor-pointer"
                                />
                            </div>
                        </div>
                    )}

                    {/* Canvas */}
                    <div
                        id="editor"
                        ref={canvasRef}
                        className="bg-(--d-admin-bg-color) flex-1 ease-animation min-h-[1024px]"
                        onMouseOver={onCanvasMouseOver}
                        onMouseLeave={onCanvasMouseLeave}
                        onMouseOut={onCanvasMouseOut}
                        onDrop={onCanvasDrop}
                        onDragOver={onCanvasDragOver}
                        onDragLeave={onCanvasDragLeave}
                        onClickCapture={onCanvasClickCapture}
                        style={{
                            boxShadow: isEmptyCanvas ? '0px 6px 0px -2px cornflowerblue inset' : 'none',
                            margin: isPreview ? '0px' : '20px',
                            maxWidth: isPreview ? '100%' : '868px',
                            outline: 'none',
                        }}
                        contentEditable={!isPreview}
                    />
                </div>
            </div>
        </div>
    );
}
