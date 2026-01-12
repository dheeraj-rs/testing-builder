/**
 * Link Dialog Component
 * Allows users to update link URLs and target
 */

import React, { useEffect, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { classMixin } from '../../lib/classMixin';

interface LinkDialogProps {
    isOpen: boolean;
    onClose: () => void;
    element: HTMLAnchorElement | null;
}

export function LinkDialog({ isOpen, onClose, element }: LinkDialogProps) {
    const [link, setLink] = useState('');
    const [newTab, setNewTab] = useState(true);

    useEffect(() => {
        if (element && element.href) {
            const url = new URL(element.href);
            const linkNew =
                url.hostname === 'localhost'
                    ? url.pathname.replace('/', '') + url.hash
                    : element.href;
            setLink(linkNew);
        } else {
            setLink('');
        }
    }, [element]);

    const onSave = () => {
        if (!element) return;

        const linkElement = element;
        onClose();
        setLink('');

        // eslint-disable-next-line
        linkElement.href = link;
        // eslint-disable-next-line
        linkElement.target = newTab ? '_blank' : '_self';
    };

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay>
                    <DialogPrimitive.Content
                        className={classMixin(
                            'fixed shadow bg-(--d-admin-surface-card) rounded-lg p-4',
                            'w-[95vw] max-w-md md:w-full',
                            'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                        )}
                    >
                        <DialogPrimitive.Title className="text-sm font-medium text-(--d-admin-text-color)">
                            Update Link
                        </DialogPrimitive.Title>

                        <div className="mt-8 mb-4">
                            <div>
                                <div>
                                    <div className="flex justify-center mb-4 flex-col">
                                        <input
                                            type="text"
                                            className="bg-(--d-admin-surface-ground) border border-(--d-admin-surface-border) text-(--d-admin-text-color) text-sm rounded-lg block w-full p-2.5 mb-4"
                                            placeholder="Eg. https://github.com/LiveDuo/destack"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                        />
                                        <div className="flex items-center ml-4">
                                            <p>Open in new tab</p>
                                            <input
                                                defaultChecked={newTab}
                                                type="checkbox"
                                                onChange={(e) => setNewTab(e.target.checked)}
                                                className="ml-4 w-4 h-4 text-(--d-admin-blue-600) bg-(--d-admin-surface-ground) border-(--d-admin-surface-border) focus:ring-(--d-admin-blue-600) focus:ring-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <DialogPrimitive.Close
                                onClick={onSave}
                                className={classMixin(
                                    'inline-flex select-none justify-center rounded-md px-4 py-2 text-sm font-medium',
                                    'bg-(--d-admin-blue-600) text-(--d-admin-text-color) hover:bg-(--d-admin-blue-700) border border-transparent'
                                )}
                            >
                                Save
                            </DialogPrimitive.Close>
                        </div>

                        <DialogPrimitive.Close
                            onClick={() => onClose()}
                            className={classMixin(
                                'absolute top-3.5 right-3.5 inline-flex items-center justify-center rounded-full p-1'
                            )}
                        >
                            <XMarkIcon className="h-4 w-4 text-(--d-admin-text-color-secondary) hover:text-(--d-admin-text-color)" />
                        </DialogPrimitive.Close>
                    </DialogPrimitive.Content>
                </DialogPrimitive.Overlay>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
