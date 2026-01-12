
"use client";
import { useState, useCallback, useEffect } from 'react';
import { PortDropdown } from '@/app/(builder)/website-builder/components/workbench/PortDropdown';
import { activePreviewIndexStore, urlStore, iframeUrlStore, previewRefreshTrigger } from '@/app/(builder)/website-builder/lib/stores/preview';
import { useStore } from '@nanostores/react';
import { Icon } from '@iconify/react';
import { chatStore } from '@/app/(builder)/website-builder/lib/stores/chat';
import { workbenchStore } from '@/app/(builder)/website-builder/lib/stores/workbench';
import { classNames } from '@/app/(builder)/website-builder/utils/classNames';
import { description } from '@/app/(builder)/website-builder/lib/persistence/useChatHistory';
import AppTopbarMenu from '@/core/layouts/default-bar/topbar-content/AppTopbarMenu';
import Link from 'next/link';
import { exportProjectAsZip } from '@/app/(builder)/website-builder/utils/zip';

function WebsiteBuilderTopbar() {
    const showWorkbench = useStore(workbenchStore.showWorkbench);
    const { showChat } = useStore(chatStore);
    const previews = useStore(workbenchStore.previews);
    const activePreviewIndex = useStore(activePreviewIndexStore);
    const url = useStore(urlStore);
    const activePreview = previews[activePreviewIndex];

    const chat = useStore(chatStore);
    const chatDescription = useStore(description);
    const { showHistory } = useStore(chatStore);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (activePreview) {
            urlStore.set(activePreview.baseUrl);
            iframeUrlStore.set(activePreview.baseUrl);
        }
    }, [activePreview]);

    const canHideChat = showWorkbench || !showChat;

    const validateUrl = useCallback(
        (value: string) => {
            if (!activePreview) {
                return false;
            }

            const { baseUrl } = activePreview;

            if (value === baseUrl) {
                return true;
            } else if (value.startsWith(baseUrl)) {
                return ['/', '?', '#'].includes(value.charAt(baseUrl.length));
            }

            return false;
        },
        [activePreview],
    );



    return (
        <div className="layout-topbar builder-topbar-custom flex items-center justify-between px-4 gap-4">


            <div className="builder-topbar-left flex items-center gap-2 min-w-0">
                <Link
                    href="/"
                    className="p-2 rounded-md text-gray-500 hover:text-color hover:bg-surface-d transition-all flex items-center justify-center"
                >
                    <i className="pi pi-chevron-left" />
                </Link>
                <AppTopbarMenu />

                {chat.started && (
                    <span className="flex-1 px-4 truncate text-center text-primary min-w-0 max-w-xs md:max-w-md lg:max-w-lg">
                        {chatDescription}
                    </span>
                )}
            </div>

            <div className="builder-topbar-center hidden md:block flex-1 max-w-2xl mx-auto">
                <div className="relative flex items-center w-full bg-surface-c rounded-lg border border-surface px-3 py-2">
                    {activePreview && (
                        <div className="mr-2">
                            <PortDropdown
                                activePreviewIndex={activePreviewIndex}
                                setActivePreviewIndex={(index) => activePreviewIndexStore.set(index)}
                                isDropdownOpen={isDropdownOpen}
                                setIsDropdownOpen={setIsDropdownOpen}
                                setHasSelectedPreview={() => { }}
                                previews={previews}
                            />
                        </div>
                    )}
                    {!activePreview && <Icon icon="ph:lock-key-duotone" className="text-gray-400 mr-2" />}
                    <input
                        className="w-full bg-transparent outline-none text-sm text-color md:block hidden"
                        type="text"
                        value={url}
                        onChange={(e) => urlStore.set(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (validateUrl(url)) {
                                    iframeUrlStore.set(url);
                                } else {
                                    iframeUrlStore.set(url);
                                }
                            }
                        }}
                    />
                    <div className="flex items-center gap-1 ml-2">
                        <button
                            className="p-1 hover:bg-surface-d rounded-md text-gray-400 hover:text-color transition-colors"
                            onClick={() => {
                                iframeUrlStore.set(url);
                                previewRefreshTrigger.set(previewRefreshTrigger.get() + 1);
                            }}
                        >
                            <Icon icon="ph:arrow-clockwise" />
                        </button>
                    </div>
                </div>
            </div>



            <div className="builder-topbar-right">
                {/* History Toggle button */}
                <div className="flex items-center bg-surface-c rounded-lg border border-surface p-1 mr-2">
                    <button
                        className={classNames(
                            'p-1.5 rounded-md transition-all flex items-center justify-center',
                            showHistory ? 'bg-surface-d text-primary shadow-sm' : 'text-gray-500 hover:text-color hover:bg-surface-d'
                        )}
                        onClick={() => {
                            console.log('Toggling history', !showHistory);
                            chatStore.setKey('showHistory', !showHistory);
                        }}
                        title="History"
                    >
                        <Icon icon="ph:clock-counter-clockwise-duotone" className="text-lg" />
                    </button>
                </div>

                {/* View Toggles */}
                <div className="flex items-center bg-surface-c rounded-lg border border-surface p-1">
                    <button
                        className={classNames(
                            'p-1.5 rounded-md transition-all flex items-center gap-2',
                            showChat ? 'bg-surface-d text-primary shadow-sm' : 'text-gray-500 hover:text-color'
                        )}
                        onClick={() => {
                            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                            const newShowChat = !showChat;

                            if (canHideChat) {
                                chatStore.setKey('showChat', newShowChat);

                                // On mobile, hide workbench when showing chat
                                if (isMobile && newShowChat && showWorkbench) {
                                    workbenchStore.showWorkbench.set(false);
                                }
                            }
                        }}
                        disabled={!canHideChat}
                        title="Toggle Chat"
                    >
                        <Icon icon="ph:chat-circle-dots-duotone" className="text-lg" />
                    </button>

                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                    <button
                        className={classNames(
                            'p-1.5 rounded-md transition-all flex items-center gap-2',
                            showWorkbench ? 'bg-surface-d text-primary shadow-sm' : 'text-gray-500 hover:text-color'
                        )}
                        onClick={() => {
                            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                            const newShowState = !showWorkbench;

                            if (showWorkbench && !showChat) {
                                chatStore.setKey('showChat', true);
                            }

                            // On mobile, hide chat when showing workbench
                            if (isMobile && newShowState && showChat) {
                                chatStore.setKey('showChat', false);
                            }

                            workbenchStore.userHidWorkbench.set(!newShowState);
                            workbenchStore.showWorkbench.set(newShowState);
                        }}
                        title="Toggle Code"
                    >
                        <Icon icon="ph:code-duotone" className="text-lg" />
                    </button>

                </div>

                {/* Export Button */}
                <button
                    className="mr-2 flex items-center gap-2 px-3 md:px-4 py-2 bg-surface-c rounded-lg border border-surface hover:bg-surface-d transition-colors font-medium text-sm"
                    onClick={() => {
                        const files = workbenchStore.files.get();
                        exportProjectAsZip(files);
                    }}
                    title="Export as ZIP"
                >
                    <Icon icon="ph:download-duotone" className="text-lg" />
                    <span className="hidden md:inline">Export</span>
                </button>

                <Link
                    href="/website-builder/publish"
                    className="mr-2 flex items-center gap-2 px-3 md:px-4 py-2 bg-surface-c rounded-lg border border-surface hover:bg-surface-d transition-colors font-medium text-sm"
                    title="Deploy to Vercel"
                >
                    <Icon icon="ph:rocket-launch-duotone" className="text-lg" />
                    <span className="hidden md:inline">Publish</span>
                </Link>
            </div>
        </div >
    )
}

export default WebsiteBuilderTopbar