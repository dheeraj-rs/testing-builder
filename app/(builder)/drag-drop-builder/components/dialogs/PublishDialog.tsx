/**
 * Publish Dialog Component
 * Allows users to choose publish format: HTML or React
 */

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import DocumentIcon from '@heroicons/react/24/outline/DocumentIcon';
import CodeBracketIcon from '@heroicons/react/24/outline/CodeBracketIcon';
import { classMixin } from '../../lib/classMixin';

interface PublishDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onPublishHTML: () => void;
    onPublishReact: () => void;
}

export function PublishDialog({ isOpen, onClose, onPublishHTML, onPublishReact }: PublishDialogProps) {
    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
                <DialogPrimitive.Content
                    className={classMixin(
                        'fixed shadow-lg bg-(--d-admin-surface-card) rounded-lg p-6',
                        'w-[95vw] max-w-md md:w-full',
                        'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                    )}
                >
                    <DialogPrimitive.Title className="text-lg font-semibold text-(--d-admin-text-color) mb-4">
                        Choose Deployment Format
                    </DialogPrimitive.Title>

                    <div className="space-y-3">
                        {/* HTML Option */}
                        <button
                            onClick={() => {
                                onPublishHTML();
                                onClose();
                            }}
                            className={classMixin(
                                'w-full flex items-center p-4 rounded-lg border-2 border-(--d-admin-surface-border)',
                                'hover:border-(--d-admin-blue-600) hover:bg-(--d-admin-blue-50) transition-all',
                                'text-left group'
                            )}
                        >
                            <DocumentIcon className="h-8 w-8 text-(--d-admin-text-color-secondary) group-hover:text-(--d-admin-blue-600) mr-4" />
                            <div>
                                <div className="font-semibold text-(--d-admin-text-color) group-hover:text-(--d-admin-blue-600)">
                                    Static HTML
                                </div>
                                <div className="text-sm text-(--d-admin-text-color-secondary)">
                                    Deploy as a standalone HTML file with Tailwind CSS
                                </div>
                            </div>
                        </button>

                        {/* React Option */}
                        <button
                            onClick={() => {
                                onPublishReact();
                                onClose();
                            }}
                            className={classMixin(
                                'w-full flex items-center p-4 rounded-lg border-2 border-(--d-admin-surface-border)',
                                'hover:border-(--d-admin-primary-600) hover:bg-(--d-admin-surface-d) transition-all',
                                'text-left group'
                            )}
                        >
                            <CodeBracketIcon className="h-8 w-8 text-(--d-admin-text-color-secondary) group-hover:text-(--d-admin-primary-600) mr-4" />
                            <div>
                                <div className="font-semibold text-(--d-admin-text-color) group-hover:text-(--d-admin-primary-600)">
                                    React Project (Vite)
                                </div>
                                <div className="text-sm text-(--d-admin-text-color-secondary)">
                                    Deploy as a complete React + Vite + Tailwind CSS project
                                </div>
                            </div>
                        </button>
                    </div>

                    <DialogPrimitive.Close
                        onClick={() => onClose()}
                        className={classMixin(
                            'absolute top-4 right-4 inline-flex items-center justify-center rounded-full p-1',
                            'hover:bg-(--d-admin-surface-hover)'
                        )}
                    >
                        <XMarkIcon className="h-5 w-5 text-(--d-admin-text-color-secondary) hover:text-(--d-admin-text-color)" />
                    </DialogPrimitive.Close>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
