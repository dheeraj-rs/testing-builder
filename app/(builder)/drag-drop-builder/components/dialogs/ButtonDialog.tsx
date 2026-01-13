/**
 * Button Dialog Component
 * Allows users to configure button actions (URL, email, submit)
 */

import React, { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import { classMixin } from '../../lib/classMixin';
import { Select } from '../Select';

const capitalize = (text: string) => text[0].toUpperCase() + text.substring(1, text.length);

const typeOptions = ['url', 'email', 'submit'];
const methodOptions = ['GET', 'POST'];

interface ButtonDialogProps {
    isOpen: boolean;
    onClose: () => void;
    element: HTMLButtonElement | null;
}

export function ButtonDialog({ isOpen, onClose, element }: ButtonDialogProps) {
    const [openSelect, setOpenSelect] = useState(false);
    const [url, setUrl] = useState('');
    const [email, setEmail] = useState('');
    const [submitUrl, setSubmitUrl] = useState('');
    const [submitMethod, setSubmitMethod] = useState('GET');
    const [submitAsync, setSubmitAsync] = useState(true);
    const [methodSelect, setMethodSelect] = useState(false);
    const [newTab, setNewTab] = useState(true);
    const [type, setType] = useState('url');

    const onSave = () => {
        if (!element) return;

        onClose();

        if (type === 'url') {
            if (newTab) {
                const source = `window.open('${url}', '_blank')`;
                element.setAttribute('onclick', source);
                element.setAttribute('type', 'button');
            } else {
                const source = `window.location.href = '${url}'`;
                element.setAttribute('onclick', source);
                element.setAttribute('type', 'button');
            }
        } else if (type === 'email') {
            const source = `window.location.href = 'mailto:${email}'`;
            element.setAttribute('onclick', source);
            element.setAttribute('type', 'button');
        } else if (type === 'submit') {
            if (submitAsync) {
                const source = `
          const e = arguments[0]
          const form = e.target.closest('form')

          const formData = new FormData()
          for (let e of form.elements) {
            if (e.type !== 'submit') {
              formData.append(e.id, e.type === 'radio' ? e.checked : e.value)
            }
          }

          const options = { method: '${submitMethod}', body: ${submitMethod !== 'GET' ? 'formData' : 'null'} }
          fetch('${submitUrl}', options)
            .then((e) => e.text().then((d) => ({ ok: e.ok, text: d })))
            .then(({ ok, text }) => {
              alert(ok ? text ?? 'Success' : 'Something went wrong')
          })
        `;
                element.setAttribute('onclick', source);
                element.setAttribute('type', 'button');
            } else {
                const source = `
          const e = arguments[0]
          const form = e.target.closest('form')
          form.submit()
        `;
                element.setAttribute('onclick', source);
                element.setAttribute('type', 'button');
            }
        }
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
                            Update Button
                        </DialogPrimitive.Title>

                        <div className="mt-2 text-sm font-normal text-(--d-admin-text-color-secondary)">
                            <div className="mt-4 mb-4">
                                <div>
                                    <Select
                                        trigger={
                                            <div
                                                className="flex rounded py-2 px-4 transition cursor-pointer items-center ml-2 mb-4"
                                            >
                                                {capitalize(type)} <ChevronDownIcon className="h-4 w-4 ml-2" />
                                            </div>
                                        }
                                        defaultValue={type}
                                        values={typeOptions.map((o) => capitalize(o))}
                                        open={openSelect}
                                        setOpen={setOpenSelect}
                                        onChange={(e) => setType(e.toLowerCase())}
                                    />

                                    <div>
                                        {/* URL */}
                                        {type === 'url' && (
                                            <div className="flex justify-center mb-4 flex-col">
                                                <input
                                                    type="text"
                                                    className="bg-(--d-admin-surface-ground) border border-(--d-admin-surface-border) text-(--d-admin-text-color) text-sm rounded-lg block w-full p-2.5 mb-4"
                                                    placeholder="Eg. https://github.com/LiveDuo/destack"
                                                    defaultValue={url}
                                                    onChange={(e) => setUrl(e.target.value)}
                                                />
                                                <div className="flex items-center ml-4">
                                                    <span>Open in new tab</span>
                                                    <input
                                                        defaultChecked={newTab}
                                                        type="checkbox"
                                                        onChange={(e) => setNewTab(e.target.checked)}
                                                        className="ml-4 w-4 h-4 text-(--d-admin-blue-600) bg-(--d-admin-surface-ground) border-(--d-admin-surface-border) focus:ring-(--d-admin-blue-600) focus:ring-2"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {/* Email */}
                                        {type === 'email' && (
                                            <div className="flex justify-center mb-4">
                                                <input
                                                    type="text"
                                                    className="bg-(--d-admin-surface-ground) border border-(--d-admin-surface-border) text-(--d-admin-text-color) text-sm rounded-lg block w-full p-2.5"
                                                    placeholder="Eg. matt@mullenweg.com"
                                                    defaultValue={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                            </div>
                                        )}
                                        {/* Submit */}
                                        {type === 'submit' && (
                                            <div className="flex justify-center mb-4 flex-col">
                                                <div className="flex justify-end mb-4">
                                                    <input
                                                        type="text"
                                                        className="bg-(--d-admin-surface-ground) border border-(--d-admin-surface-border) text-(--d-admin-text-color) text-sm rounded-lg block w-full p-2.5"
                                                        placeholder="Eg. /api/submit"
                                                        defaultValue={submitUrl}
                                                        onChange={(e) => setSubmitUrl(e.target.value)}
                                                    />
                                                    <Select
                                                        trigger={
                                                            <div
                                                                className="flex rounded py-2 px-4 transition cursor-pointer items-center ml-2"
                                                            >
                                                                {submitMethod} <ChevronDownIcon className="h-4 w-4 ml-2" />
                                                            </div>
                                                        }
                                                        defaultValue={submitMethod}
                                                        values={methodOptions}
                                                        open={methodSelect}
                                                        setOpen={setMethodSelect}
                                                        onChange={(e) => setSubmitMethod(e)}
                                                    />
                                                </div>
                                                <div className="flex items-center ml-4">
                                                    <span>Async</span>
                                                    <input
                                                        defaultChecked={submitAsync}
                                                        type="checkbox"
                                                        onChange={(e) => setSubmitAsync(e.target.checked)}
                                                        className="ml-4 w-4 h-4 text-(--d-admin-blue-600) bg-(--d-admin-surface-ground) border-(--d-admin-surface-border) focus:ring-(--d-admin-blue-600) focus:ring-2"
                                                    />
                                                </div>
                                            </div>
                                        )}
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
