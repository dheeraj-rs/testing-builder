'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { atom } from 'nanostores';
import type { Message } from 'ai';
import { toast } from 'react-toastify';
import { workbenchStore } from '@/app/(builder)/website-builder/lib/stores/workbench';
import {
  getMessages,
  getNextId,
  getUrlId,
  openDatabase,
  setMessages,
} from './db';

export interface ChatHistoryItem {
  id: string;
  urlId?: string;
  description?: string;
  messages: Message[];
  timestamp: string;
}

const persistenceEnabled =
  typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_DISABLE_PERSISTENCE;

let dbPromise: Promise<IDBDatabase | undefined> | undefined;

export const getDb = async () => {
  if (!persistenceEnabled) {
    return undefined;
  }
  if (!dbPromise) {
    dbPromise = openDatabase();
  }
  return dbPromise;
};

export const chatId = atom<string | undefined>(undefined);
export const description = atom<string | undefined>(undefined);

export function useChatHistory() {
  const router = useRouter();
  const params = useParams();
  const mixedId = params?.id as string | undefined;

  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [urlId, setUrlId] = useState<string | undefined>();

  useEffect(() => {
    const init = async () => {
      const dbInstance = await getDb();
      if (!dbInstance) {
        setReady(true);

        if (persistenceEnabled) {
          toast.error(`Chat persistence is unavailable`);
        }

        return;
      }

      if (mixedId) {
        getMessages(dbInstance, mixedId)
          .then((storedMessages) => {
            if (storedMessages && storedMessages.messages.length > 0) {
              setInitialMessages(storedMessages.messages);
              setUrlId(storedMessages.urlId);
              description.set(storedMessages.description);
              chatId.set(storedMessages.id);
            } else {
              router.replace('/');
            }

            setReady(true);
          })
          .catch((error) => {
            toast.error(error.message);
          });
      }
    };
    init();
  }, []);

  return {
    ready: !mixedId || ready,
    initialMessages,
    storeMessageHistory: async (messages: Message[]) => {
      const dbInstance = await getDb();
      if (!dbInstance || messages.length === 0) {
        return;
      }

      const { firstArtifact } = workbenchStore;

      if (!urlId && firstArtifact?.id) {
        const urlId = await getUrlId(dbInstance, firstArtifact.id);

        navigateChat(urlId);
        setUrlId(urlId);
      }

      if (!description.get() && firstArtifact?.title) {
        description.set(firstArtifact?.title);
      }

      if (initialMessages.length === 0 && !chatId.get()) {
        const nextId = await getNextId(dbInstance);

        chatId.set(nextId);

        if (!urlId) {
          navigateChat(nextId);
        }
      }

      await setMessages(
        dbInstance,
        chatId.get() as string,
        messages,
        urlId,
        description.get()
      );
    },
  };
}

function navigateChat(nextId: string) {
  /**
   * We use window.history.replaceState to verify strictly we are only changing the URL parameter
   * without triggering a full router navigation that might re-mount components unnecessarily.
   */
  const url = new URL(window.location.href);
  url.pathname = `/website-builder/${nextId}`;

  window.history.replaceState({}, '', url);
}
