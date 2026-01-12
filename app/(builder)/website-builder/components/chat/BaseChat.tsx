import type { Message } from 'ai';
import { Icon } from '@iconify/react';
import React, { type RefCallback } from 'react';
import { ClientOnly } from '@/app/(builder)/website-builder/components/ClientOnly';
import { IconButton } from '@/app/(builder)/website-builder/components/ui/IconButton';
import { classNames } from '@/app/(builder)/website-builder/utils/classNames';
import { Messages } from './Messages.client';
import { ModelSelector, type ModelProvider } from './ModelSelector';
import { SendButton } from './SendButton.client';

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  selectedProvider?: ModelProvider;
  onProviderChange?: (provider: ModelProvider) => void;
}

const EXAMPLE_PROMPTS = [
  { text: 'Build a todo app in React using Tailwind' },
  { text: 'Build a simple blog using Astro' },
  { text: 'Create a cookie consent form using Material UI' },
  { text: 'Make a space invaders game' },
  { text: 'How do I center a div?' },
];

const TEXTAREA_MIN_HEIGHT = 76;

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      enhancingPrompt = false,
      promptEnhanced = false,
      messages,
      input = '',
      sendMessage,
      handleInputChange,
      enhancePrompt,
      handleStop,
      selectedProvider = 'google',
      onProviderChange,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

    return (
      <div
        ref={ref}
        className={classNames(
          'baseChat',
          'flex h-full',
          'transition-opacity duration-200 bolt-ease-cubic-bezier',
          {
            'opacity-100': showChat,
            'opacity-0 pointer-events-none': !showChat,
          },
        )}
        data-chat-visible={showChat}
      >
        <div
          ref={scrollRef}
          className={classNames('scrollContainer', {
            'landing': !chatStarted,
          })}
        >
          {chatStarted ? (
            <ClientOnly>
              {() => {
                return (
                  <Messages
                    ref={messageRef}
                    className="flex flex-col w-full flex-1 max-w-4xl px-4 mx-auto z-1"
                    messages={messages}
                    isStreaming={isStreaming}
                  />
                );
              }}
            </ClientOnly>
          ) : (
            <div id="intro" className="intro">
              <h1 className="text-5xl text-center font-bold text-primary mb-2">
                What will you build today?
              </h1>
              <p className="mb-4 text-center text-secondary">
                Create stunning apps & websites by chatting with AI.
              </p>

              {/* Example prompts in the center */}
              <div id="examples-center" className="examples-center">
                {EXAMPLE_PROMPTS.map((examplePrompt, index) => (
                  <button
                    key={index}
                    onClick={(event) => sendMessage?.(event, examplePrompt.text)}
                    className="exampleButton"
                  >
                    {examplePrompt.text}
                    <Icon icon="ph:arrow-right" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area - Centered in Landing, Fixed Bottom in Chat */}
          <div
            className={classNames('inputArea', {
              'landing': !chatStarted,
              'absolute bottom-0 left-0 right-0': chatStarted,
            })}
          >
            <div className="inputContainer">
              <textarea
                ref={textareaRef}
                className="textarea"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    if (event.shiftKey) {
                      return;
                    }
                    event.preventDefault();
                    sendMessage?.(event);
                  }
                }}
                value={input}
                onChange={(event) => {
                  handleInputChange?.(event);
                }}
                style={{
                  minHeight: TEXTAREA_MIN_HEIGHT,
                  maxHeight: TEXTAREA_MAX_HEIGHT,
                }}
                placeholder="How can D Admin help you today?"
                translate="no"
              />
              <ClientOnly>
                {() => (
                  <SendButton
                    show={true}
                    isStreaming={isStreaming}
                    onClick={(event) => {
                      if (isStreaming) {
                        handleStop?.();
                        return;
                      }
                      sendMessage?.(event);
                    }}
                  />
                )}
              </ClientOnly>
              <div className="flex justify-between items-center text-sm p-4 pt-2">
                {/* Left side - Text input hints */}
                <div className="flex gap-4 items-center">
                  <div className="flex gap-1 items-center">
                    <IconButton
                      title="Enhance prompt"
                      disabled={input.length === 0 || enhancingPrompt}
                      className={classNames({
                        'opacity-100!': enhancingPrompt,
                        'text-blue-500! pr-1.5 enabled:hover:bg-blue-500/10!':
                          promptEnhanced,
                      })}
                      onClick={() => enhancePrompt?.()}
                    >
                      {enhancingPrompt ? (
                        <>
                          <Icon icon="svg-spinners:90-ring-with-bg" className="text-blue-500 text-xl" />
                          <div className="ml-1.5">Enhancing prompt...</div>
                        </>
                      ) : (
                        <>
                          <Icon icon="ph:sparkle" className="text-xl" />
                          {promptEnhanced && <div className="ml-1.5">Prompt enhanced</div>}
                        </>
                      )}
                    </IconButton>
                  </div>
                </div>

                {/* Right side - Model selector */}
                {onProviderChange && (
                  <ClientOnly>
                    {() => (
                      <ModelSelector value={selectedProvider} onChange={onProviderChange} />
                    )}
                  </ClientOnly>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

BaseChat.displayName = 'BaseChat';
