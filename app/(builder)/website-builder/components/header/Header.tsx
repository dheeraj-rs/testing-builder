'use client';

import { useStore } from '@nanostores/react';
import { Icon } from '@iconify/react';
import { chatStore } from '@/app/(builder)/website-builder/lib/stores/chat';
import { description } from '@/app/(builder)/website-builder/lib/persistence/useChatHistory';
import { classNames } from '@/app/(builder)/website-builder/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';

export function Header() {
  const chat = useStore(chatStore);
  const chatDescription = useStore(description);

  return (
    <header
      className={classNames(
        'fixed top-0 left-0 right-0 w-full z-30 flex items-center bg-surface-b key-border-b h-[var(--header-height)] p-5 border-b',
        {
          'border-transparent': !chat.showChat,
          'border-surface': chat.showChat,
        },
      )}
    >
      <div className="flex items-center gap-2">
        <Icon icon="ph:sidebar-simple-duotone" className="text-xl text-gray-500" />
      </div>

      {chat.started && (
        <>
          <span className="flex-1 px-4 truncate text-center text-primary">
            {chatDescription}
          </span>
          <HeaderActionButtons />
        </>
      )}
    </header>
  );
}
