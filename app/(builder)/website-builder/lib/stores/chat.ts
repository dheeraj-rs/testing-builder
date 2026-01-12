import { map } from 'nanostores';

export type ModelProvider = 'anthropic' | 'google' | 'openai';

export const chatStore = map({
  started: false,
  aborted: false,
  showChat: true,
  showHistory: false,
  selectedProvider: 'google' as ModelProvider,
});
