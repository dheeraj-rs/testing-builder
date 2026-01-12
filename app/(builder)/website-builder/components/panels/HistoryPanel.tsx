import { useStore } from '@nanostores/react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatStore } from '@/app/(builder)/website-builder/lib/stores/chat';
import { Menu } from '@/app/(builder)/website-builder/components/sidebar/Menu.client';
import { Icon } from '@iconify/react';
import { classNames } from '@/app/(builder)/website-builder/utils/classNames';

export const HistoryPanel = () => {
    const { showHistory } = useStore(chatStore);
    return (
        <AnimatePresence>
            {showHistory && (
                <>
                    {/* Backdrop for outside click */}
                    <motion.div
                        className="absolute inset-0 z-[19"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => chatStore.setKey('showHistory', false)}
                    />
                    <motion.div
                        key="history-panel"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className={classNames(
                            "absolute right-0 top-0 bottom-0 z-[20] w-80",
                            "bg-[var(--d-admin-surface-ground)] text-[var(--d-admin-color-text)] border-l border-surface shadow-sm",
                            "flex flex-col"
                        )}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-surface">
                            <span className="font-medium text-lg text-color">History</span>
                            <button
                                onClick={() => chatStore.setKey('showHistory', false)}
                                className="p-1 hover:bg-surface-d rounded-md text-gray-500 hover:text-color transition-colors"
                            >
                                <Icon icon="ph:x" className="text-xl" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Menu onSelect={() => chatStore.setKey('showHistory', false)} />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
