'use client';

import { Icon } from '@iconify/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '@/app/(builder)/website-builder/components/ui/Dialog';
import { ThemeSwitch } from '@/app/(builder)/website-builder/components/ui/ThemeSwitch';
import { getDb, deleteById, getAll, chatId, type ChatHistoryItem } from '@/app/(builder)/website-builder/lib/persistence';
import { logger } from '@/app/(builder)/website-builder/utils/logger';
import { HistoryItem } from './HistoryItem';
import { binDates } from './date-binning';

type DialogContent = { type: 'delete'; item: ChatHistoryItem } | null;

interface MenuProps {
  onSelect?: () => void;
}

export function Menu({ onSelect }: MenuProps) {
  const [list, setList] = useState<ChatHistoryItem[]>([]);
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);

  const loadEntries = useCallback(() => {
    getDb().then((db) => {
      if (db) {
        getAll(db)
          .then((list) => list.filter((item) => item.urlId && item.description))
          .then(setList)
          .catch((error) => toast.error(error.message));
      }
    });
  }, []);

  const deleteItem = useCallback((event: React.UIEvent, item: ChatHistoryItem) => {
    event.preventDefault();

    getDb().then((db) => {
      if (db) {
        deleteById(db, item.id)
          .then(() => {
            loadEntries();

            if (chatId.get() === item.id) {
              // hard page navigation to clear the stores
              window.location.pathname = '/website-builder';
            }
          })
          .catch((error) => {
            toast.error('Failed to delete conversation');
            logger.error(error);
          });
      }
    });
  }, []);

  const closeDialog = () => {
    setDialogContent(null);
  };

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return (
    <div
      className="flex flex-col h-full w-full"
    >
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <div className="p-4">
          <a
            href="/website-builder"
            className="flex gap-2 items-center bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-md p-2 transition-colors"
          >
            <Icon icon="ph:chat-circle-dots" className="text-lg" />
            Start new chat
          </a>
        </div>
        <div className="font-medium pl-6 pr-5 my-2">Your Chats</div>
        <div className="flex-1 overflow-scroll pl-4 pr-5 pb-5">
          {list.length === 0 && <div className="pl-2">No previous conversations</div>}
          <DialogRoot open={dialogContent !== null}>
            {binDates(list).map(({ category, items }) => (
              <div key={category} className="mt-4 first:mt-0 space-y-1">
                <div className="sticky top-0 z-1 pl-2 pt-2 pb-1">
                  {category}
                </div>
                {items.map((item) => (
                  <HistoryItem key={item.id} item={item} onDelete={() => setDialogContent({ type: 'delete', item })} onSelect={onSelect} />
                ))}
              </div>
            ))}
            <Dialog onBackdrop={closeDialog} onClose={closeDialog}>
              {dialogContent?.type === 'delete' && (
                <>
                  <DialogTitle>Delete Chat?</DialogTitle>
                  <DialogDescription asChild>
                    <div>
                      <p>
                        You are about to delete <strong>{dialogContent.item.description}</strong>.
                      </p>
                      <p className="mt-1">Are you sure you want to delete this chat?</p>
                    </div>
                  </DialogDescription>
                  <div className="px-5 pb-4 flex gap-2 justify-end">
                    <DialogButton type="secondary" onClick={closeDialog}>
                      Cancel
                    </DialogButton>
                    <DialogButton
                      type="danger"
                      onClick={(event) => {
                        deleteItem(event, dialogContent.item);
                        closeDialog();
                      }}
                    >
                      Delete
                    </DialogButton>
                  </div>
                </>
              )}
            </Dialog>
          </DialogRoot>
        </div>
        <div className="flex items-center p-4">
          <ThemeSwitch className="ml-auto" />
        </div>
      </div>
    </div>
  );
}
