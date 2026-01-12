import type { Message } from 'ai';
import { Icon } from '@iconify/react';
import React from 'react';
import { classNames } from '@/app/(builder)/website-builder/utils/classNames';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

interface MessagesProps {
    id?: string;
    className?: string;
    isStreaming?: boolean;
    messages?: Message[];
}

export const Messages = React.forwardRef<HTMLDivElement, MessagesProps>((props: MessagesProps, ref) => {
    const { id, isStreaming = false, messages = [] } = props;

    return (
        <div id={id} ref={ref} className={props.className} style={{ paddingBottom: '10rem' }}>
            {messages.length > 0
                ? messages.map((message, index) => {
                    const { role, content } = message;
                    const isUserMessage = role === 'user';
                    const isFirst = index === 0;

                    return (
                        <div
                            key={index}
                            className={classNames('flex w-full', {
                                'mt-6': !isFirst,
                                'justify-end': isUserMessage, // User messages on right
                                'justify-start': !isUserMessage, // AI messages on left
                            })}
                        >
                            {isUserMessage ? (
                                // User message - boxed style on right (text only, no icon)
                                <div className="flex gap-3 items-start max-w-[85%] bg-surface-c px-4 py-3 rounded-2xl">
                                    <div className="flex-1 min-w-0">
                                        <UserMessage content={content} />
                                    </div>
                                </div>
                            ) : (
                                // AI message - plain text style on left (no icon)
                                <div className="flex gap-3 items-start w-full">
                                    <div className="flex-1 min-w-0">
                                        {/* D Admin branding label */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-semibold text-primary">D Admin</span>
                                        </div>
                                        {/* AI response content */}
                                        <div>
                                            <AssistantMessage content={content} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
                : null}
            {isStreaming && (
                <div className="flex justify-start w-full mt-6">
                    <div className="flex gap-3 items-start w-full">
                        <div className="flex-1 min-w-0">
                            {/* D Admin branding label */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-primary">D Admin</span>
                            </div>
                            {/* Streaming indicator */}
                            <div className="flex items-center">
                                <Icon icon="svg-spinners:3-dots-fade" className="text-2xl text-secondary" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

Messages.displayName = 'Messages';
