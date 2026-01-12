import { useStore } from '@nanostores/react';
import { Icon } from '@iconify/react';
import { chatStore } from '@/app/(builder)/website-builder/lib/stores/chat';
import { workbenchStore } from '@/app/(builder)/website-builder/lib/stores/workbench';
import { classNames } from '@/app/(builder)/website-builder/utils/classNames';

interface HeaderActionButtonsProps { }

export function HeaderActionButtons({ }: HeaderActionButtonsProps) {
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const { showChat } = useStore(chatStore);

  const canHideChat = showWorkbench || !showChat;

  return (
    <div className="flex">
      <div className="flex border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
        <Button
          active={showChat}
          disabled={!canHideChat}
          onClick={() => {
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            const newShowChat = !showChat;

            if (canHideChat) {
              chatStore.setKey('showChat', newShowChat);

              // On mobile, hide workbench when showing chat
              if (isMobile && newShowChat && showWorkbench) {
                workbenchStore.showWorkbench.set(false);
              }
            }
          }}
        >
          <Icon icon="ph:chat-circle-dots" className="text-sm" />
        </Button>

        <div className="w-[1px] bg-gray-200 dark:bg-gray-800" />
        <Button
          active={showWorkbench}
          onClick={() => {
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            const newShowState = !showWorkbench;

            if (showWorkbench && !showChat) {
              chatStore.setKey('showChat', true);
            }

            // On mobile, hide chat when showing workbench
            if (isMobile && newShowState && showChat) {
              chatStore.setKey('showChat', false);
            }

            workbenchStore.userHidWorkbench.set(!newShowState);
            workbenchStore.showWorkbench.set(newShowState);
          }}
        >
          <Icon icon="ph:code-bold" />
        </Button>
      </div>
    </div>
  );
}

interface ButtonProps {
  active?: boolean;
  disabled?: boolean;
  children?: any;
  onClick?: VoidFunction;
}

function Button({ active = false, disabled = false, children, onClick }: ButtonProps) {
  return (
    <button
      className={classNames('flex items-center p-1.5', {
        'bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100':
          !active && !disabled,
        'bg-blue-500/10 text-blue-500': active && !disabled,
        'bg-transparent text-gray-300 dark:text-gray-700 cursor-not-allowed':
          disabled,
      })}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
