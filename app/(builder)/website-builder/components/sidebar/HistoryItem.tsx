import { Icon } from '@iconify/react';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { type ChatHistoryItem } from '@/app/(builder)/website-builder/lib/persistence';

interface HistoryItemProps {
  item: ChatHistoryItem;
  onDelete?: (event: React.UIEvent) => void;
  onSelect?: () => void;
}

export function HistoryItem({ item, onDelete, onSelect }: HistoryItemProps) {
  const [hovering, setHovering] = useState(false);
  const hoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    function mouseEnter() {
      setHovering(true);

      if (timeout) {
        clearTimeout(timeout);
      }
    }

    function mouseLeave() {
      setHovering(false);
    }

    hoverRef.current?.addEventListener('mouseenter', mouseEnter);
    hoverRef.current?.addEventListener('mouseleave', mouseLeave);

    return () => {
      hoverRef.current?.removeEventListener('mouseenter', mouseEnter);
      hoverRef.current?.removeEventListener('mouseleave', mouseLeave);
    };
  }, []);

  return (
    <div
      ref={hoverRef}
      className="group rounded-md overflow-hidden flex justify-between items-center px-2 py-1"
    >
      <a
        href={`/website-builder/${item.urlId}`}
        className="flex w-full relative truncate block"
        onClick={() => onSelect?.()}
      >
        <div className="flex flex-col w-full min-w-0">
          <span className="truncate">{item.description}</span>
          <span className="text-xs truncate">
            {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}
          </span>
        </div>
        <div className="absolute right-0 z-1 top-0 bottom-0 w-10 flex justify-end group-hover:w-15 group-hover:from-45%">
          {hovering && (
            <div className="flex items-center p-1 text-gray-500 hover:text-red-500">
              <Dialog.Trigger asChild>
                <button
                  className="scale-110"
                  onClick={(event) => {
                    event.preventDefault();
                    onDelete?.(event);
                  }}
                >
                  <Icon icon="ph:trash" />
                </button>
              </Dialog.Trigger>
            </div>
          )}
        </div>
      </a>
    </div>
  );
}
