import { useStore } from '@nanostores/react';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { computed } from 'nanostores';
import { memo, useEffect, useRef, useState } from 'react';
import { createHighlighter, type BundledLanguage, type BundledTheme, type HighlighterGeneric } from 'shiki';
import type { ActionState } from '@/app/(builder)/website-builder/lib/runtime/action-runner';
import { workbenchStore } from '@/app/(builder)/website-builder/lib/stores/workbench';
import { classNames } from '@/app/(builder)/website-builder/utils/classNames';
import { cubicEasingFn } from '@/app/(builder)/website-builder/utils/easings';

const highlighterOptions = {
    langs: ['shell'],
    themes: ['light-plus', 'dark-plus'],
};

let highlighterPromise: Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> | undefined;

const getHighlighter = () => {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter(highlighterOptions);
    }
    return highlighterPromise;
};

interface ArtifactProps {
    messageId: string;
}

export const Artifact = memo(({ messageId }: ArtifactProps) => {
    const userToggledActions = useRef(false);
    const [showActions, setShowActions] = useState(false);

    const artifacts = useStore(workbenchStore.artifacts);
    const artifact = artifacts[messageId];

    const actions = useStore(
        computed(artifact.runner.actions, (actions) => {
            return Object.values(actions);
        }),
    );

    const toggleActions = () => {
        userToggledActions.current = true;
        setShowActions(!showActions);
    };

    useEffect(() => {
        if (actions.length && !showActions && !userToggledActions.current) {
            setShowActions(true);
        }
    }, [actions]);

    return (
        <div className="artifact flex flex-col overflow-hidden rounded-lg w-full transition-colors duration-150" style={{ border: '1px solid var(--d-admin-surface-border)', maxWidth: '100%' }}>
            <div className="flex">
                <button
                    className="flex items-stretch w-full overflow-hidden transition-colors"
                    style={{ backgroundColor: 'var(--surface-b)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--d-admin-surface-c)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-b)'}
                    onClick={() => {
                        const showWorkbench = workbenchStore.showWorkbench.get();
                        const newShowState = !showWorkbench;
                        workbenchStore.userHidWorkbench.set(!newShowState); // true if hiding, false if showing
                        workbenchStore.showWorkbench.set(newShowState);
                    }}
                >
                    <div className="px-5 p-3.5 w-full text-left">
                        <div className="w-full font-medium leading-5 text-sm" style={{ color: 'var(--d-admin-text-color)' }}>{artifact?.title}</div>
                        <div className="w-full text-xs mt-0.5" style={{ color: 'var(--d-admin-text-color-secondary)' }}>Click to open Workbench</div>
                    </div>
                </button>
                <div className="w-px" style={{ backgroundColor: 'var(--d-admin-surface-border)' }} />
                <AnimatePresence>
                    {actions.length && (
                        <motion.button
                            initial={{ width: 0 }}
                            animate={{ width: 'auto' }}
                            exit={{ width: 0 }}
                            transition={{ duration: 0.15, ease: cubicEasingFn }}
                            className="transition-colors"
                            style={{ backgroundColor: 'var(--surface-b)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--d-admin-surface-c)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-b)'}
                            onClick={toggleActions}
                        >
                            <div className="p-4">
                                <Icon icon={showActions ? 'ph:caret-up-bold' : 'ph:caret-down-bold'} style={{ color: 'var(--d-admin-text-color-secondary)' }} />
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
            <AnimatePresence>
                {showActions && actions.length > 0 && (
                    <motion.div
                        className="actions"
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: '0px' }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="h-px" style={{ backgroundColor: 'var(--d-admin-surface-border)' }} />
                        <div className="p-5 text-left" style={{ backgroundColor: 'var(--surface-b)' }}>
                            <ActionList actions={actions} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

interface ShellCodeBlockProps {
    classsName?: string;
    code: string;
}

function ShellCodeBlock({ classsName, code }: ShellCodeBlockProps) {
    const [html, setHtml] = useState<string>('');

    useEffect(() => {
        getHighlighter().then((highlighter) => {
            setHtml(highlighter.codeToHtml(code, {
                lang: 'shell',
                theme: 'dark-plus',
            }));
        });
    }, [code]);

    if (!html) {
        return <div className={classNames('text-xs font-mono opacity-50', classsName)}>{code}</div>;
    }

    return (
        <div
            className={classNames('text-xs', classsName)}
            dangerouslySetInnerHTML={{
                __html: html,
            }}
        ></div>
    );
}

interface ActionListProps {
    actions: ActionState[];
}

const actionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const ActionList = memo(({ actions }: ActionListProps) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <ul className="list-none space-y-2.5">
                {actions.map((action, index) => {
                    const { status, type, content } = action;
                    const isLast = index === actions.length - 1;

                    return (
                        <motion.li
                            key={index}
                            variants={actionVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{
                                duration: 0.2,
                                ease: cubicEasingFn,
                            }}
                        >
                            <div className="flex items-center gap-1.5 text-sm">
                                <div className={classNames('text-lg', getIconColor(action.status))}>
                                    {status === 'running' ? (
                                        <Icon icon="svg-spinners:90-ring-with-bg" />
                                    ) : status === 'pending' ? (
                                        <Icon icon="ph:circle-duotone" />
                                    ) : status === 'complete' ? (
                                        <Icon icon="ph:check" />
                                    ) : status === 'failed' || status === 'aborted' ? (
                                        <Icon icon="ph:x" />
                                    ) : null}
                                </div>
                                {type === 'file' ? (
                                    <div>
                                        Create{' '}
                                        <code className="px-1.5 py-1 rounded-md" style={{ backgroundColor: 'var(--d-admin-surface-c)', color: 'var(--d-admin-text-color-secondary)' }}>
                                            {action.filePath}
                                        </code>
                                    </div>
                                ) : type === 'shell' ? (
                                    <div className="flex items-center w-full min-h-[28px]">
                                        <span className="flex-1">Run command</span>
                                    </div>
                                ) : null}
                            </div>
                            {type === 'shell' && (
                                <>
                                    <ShellCodeBlock
                                        classsName={classNames('mt-1', {
                                            'mb-3.5': !isLast && status !== 'failed',
                                        })}
                                        code={content}
                                    />
                                    {status === 'failed' && 'error' in action && action.error && (
                                        <div className="mt-2 mb-3.5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                            <div className="flex items-start gap-2">
                                                <Icon icon="ph:warning-circle" className="text-red-500 text-lg mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <div className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                                                        Command Failed
                                                    </div>
                                                    <div className="text-xs text-red-600 dark:text-red-300">
                                                        {action.error}
                                                    </div>
                                                    <div className="text-xs text-red-500 dark:text-red-400 mt-2 opacity-75">
                                                        Check the terminal output above for details. The system will auto-retry if dependencies are missing.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.li>
                    );
                })}
            </ul>
        </motion.div>
    );
});

function getIconColor(status: ActionState['status']) {
    switch (status) {
        case 'pending': {
            return 'text-gray-400 dark:text-gray-500';
        }
        case 'running': {
            return 'text-blue-500';
        }
        case 'complete': {
            return 'text-green-500';
        }
        case 'aborted': {
            return 'text-gray-400 dark:text-gray-500';
        }
        case 'failed': {
            return 'text-red-500';
        }
        default: {
            return undefined;
        }
    }
}
