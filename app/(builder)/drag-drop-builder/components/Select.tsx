/**
 * Select component for dropdowns
 */

import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import { classMixin } from '../lib/classMixin';

interface SelectProps {
    defaultValue: string;
    values: string[];
    open: boolean;
    setOpen: (open: boolean) => void;
    onChange: (value: string) => void;
    trigger: React.ReactNode;
}

export function Select({ defaultValue, values, open, setOpen, onChange, trigger }: SelectProps) {
    return (
        <SelectPrimitive.Root
            defaultValue={defaultValue}
            onValueChange={onChange}
            open={open}
            onOpenChange={setOpen}
        >
            <SelectPrimitive.Trigger asChild>
                {trigger}
            </SelectPrimitive.Trigger>
            <SelectPrimitive.Content position="popper" sideOffset={5} className="z-50 max-h-[300px] overflow-hidden">
                <SelectPrimitive.Viewport className="bg-(--d-admin-surface-section) text-(--d-admin-text-color) p-2 rounded-lg shadow-lg border border-(--d-admin-surface-border)">
                    <SelectPrimitive.Group>
                        {values.map((value, index) => (
                            <SelectPrimitive.Item
                                key={index}
                                value={value}
                                className={classMixin(
                                    'relative flex items-center px-8 py-2 rounded-md text-sm text-(--d-admin-text-color) font-medium',
                                    'hover:bg-(--d-admin-surface-hover) cursor-pointer select-none focus:outline-none focus:bg-(--d-admin-surface-hover)'
                                )}
                            >
                                <SelectPrimitive.ItemText>{value}</SelectPrimitive.ItemText>
                                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                                    <CheckIcon className="h-4 w-4" />
                                </SelectPrimitive.ItemIndicator>
                            </SelectPrimitive.Item>
                        ))}
                    </SelectPrimitive.Group>
                </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
        </SelectPrimitive.Root>
    );
}
