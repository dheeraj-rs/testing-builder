/**
 * Image Dialog Component
 * Allows users to upload or set image URLs
 */

import React, { useState, useRef, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { classMixin } from '../../lib/classMixin';
import { getBaseUrl } from '../../lib/builderUtils';

interface ImageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    element: HTMLImageElement | null;
    standaloneServer: boolean;
}

export function ImageDialog({ isOpen, onClose, element, standaloneServer }: ImageDialogProps) {
    const [url, setUrl] = useState<string>('');
    const [urlText, setUrlText] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (element) {
            setUrl(element.getAttribute('src') ?? '');
        }
    }, [element]);

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const uploadedFile = e.target.files![0];
        setFile(uploadedFile);

        const reader = new FileReader();
        reader.onload = (e) => setUrl(e.target!.result as string);
        reader.readAsDataURL(uploadedFile);
    };

    const onSave = async () => {
        if (!element) return;

        const imgElement = element;
        if (url === urlText) {
            // eslint-disable-next-line
            imgElement.src = url;
        } else {
            const formData = new FormData();
            formData.append('file-0', file!);
            const baseUrl = getBaseUrl(standaloneServer);
            const uploadUrl = standaloneServer
                ? `${baseUrl}/data?path=${location.pathname}`
                : `${baseUrl}?type=data&path=${location.pathname}`;

            const res = await fetch(uploadUrl, { method: 'POST', body: formData });
            const urls = await res.json();
            // eslint-disable-next-line
            imgElement.src = urls[0];
        }

        onClose();
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
                            Upload Image
                        </DialogPrimitive.Title>

                        <div className="mt-4 mb-4">
                            {!url ? (
                                <div>
                                    <div className="flex justify-center mt-8 mb-4">
                                        <input ref={input} type="file" onChange={onUpload} style={{ display: 'none' }} />
                                        <button
                                            className="rounded-md px-4 py-2 text-sm font-medium bg-transparent border-(--d-admin-blue-600) text-(--d-admin-blue-600) hover:bg-(--d-admin-blue-700) hover:text-(--d-admin-text-color) border"
                                            onClick={() => input.current?.click()}
                                        >
                                            Upload
                                        </button>
                                    </div>
                                    <div className="flex justify-center mb-4">OR</div>
                                    <div className="flex justify-center mb-4">
                                        <input
                                            type="text"
                                            className="bg-(--d-admin-surface-ground) border border-(--d-admin-surface-border) text-(--d-admin-text-color) text-sm rounded-lg block w-full p-2.5"
                                            placeholder="Eg. https://www.w3schools.com/html/pic_trulli.jpg"
                                            onChange={(e) => setUrlText(e.target.value)}
                                        />
                                        <button
                                            onClick={() => setUrl(urlText)}
                                            className={classMixin(
                                                'rounded-md px-4 py-2 text-sm font-medium bg-transparent border',
                                                'text-(--d-admin-blue-600) hover:opacity-50 border border-transparent',
                                                `${urlText !== '' ? 'hover:opacity-50' : 'opacity-50 cursor-not-allowed'}`
                                            )}
                                            disabled={urlText === ''}
                                        >
                                            Set
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <img src={url} alt="Preview" />
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                style={{ marginRight: 'auto' }}
                                className={classMixin(
                                    'rounded-md px-4 py-2 text-sm font-medium bg-transparent border',
                                    'text-(--d-admin-blue-600) hover:opacity-50 border border-transparent'
                                )}
                                onClick={() => {
                                    setUrl('');
                                    setUrlText('');
                                }}
                            >
                                Replace
                            </button>

                            <DialogPrimitive.Close
                                onClick={onSave}
                                className={classMixin(
                                    'inline-flex select-none justify-center rounded-md px-4 py-2 text-sm font-medium',
                                    `bg-(--d-admin-blue-600) text-(--d-admin-text-color) border border-transparent ${url ? 'hover:bg-(--d-admin-blue-700)' : 'opacity-50 cursor-not-allowed'
                                    }`
                                )}
                                disabled={!url}
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
