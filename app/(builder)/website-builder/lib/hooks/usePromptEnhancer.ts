import { useState } from 'react';
import { toast } from 'react-toastify';
import { createScopedLogger } from '@/app/(builder)/website-builder/utils/logger';

const logger = createScopedLogger('usePromptEnhancement');

export function usePromptEnhancer() {
  const [enhancingPrompt, setEnhancingPrompt] = useState(false);
  const [promptEnhanced, setPromptEnhanced] = useState(false);

  const resetEnhancer = () => {
    setEnhancingPrompt(false);
    setPromptEnhanced(false);
  };

  const enhancePrompt = async (
    input: string,
    setInput: (value: string) => void,
    provider?: string
  ) => {
    setEnhancingPrompt(true);
    setPromptEnhanced(false);

    try {
      const response = await fetch('/api/enhancer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          provider: provider || 'google',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const originalInput = input;

      if (reader) {
        const decoder = new TextDecoder();
        let _input = '';
        let _error;

        try {
          setInput('');

          while (true) {
            const { value, done } = await reader.read();

            if (done) {
              break;
            }

            const chunk = decoder.decode(value);

            // Parse streaming data format
            // The format is like: 0:"text content"
            // We need to extract just the text content
            const lines = chunk.split('\n').filter((line) => line.trim());

            for (const line of lines) {
              // Match pattern like: 0:"content" or just plain text
              const match = line.match(/^\d+:"(.*)"/);
              if (match) {
                // Extract content from quoted string and unescape
                let content = match[1];
                // Unescape the content
                content = content
                  .replace(/\\n/g, '\n')
                  .replace(/\\"/g, '"')
                  .replace(/\\\\/g, '\\');
                _input += content;
              } else if (line && !line.startsWith('0:')) {
                // Plain text line
                _input += line;
              }
            }

            logger.trace('Set input', _input);
            setInput(_input);
          }
        } catch (error) {
          _error = error;
          setInput(originalInput);
          toast.error('Error enhancing prompt');
        } finally {
          if (_error) {
            logger.error(_error);
          }

          setEnhancingPrompt(false);
          setPromptEnhanced(!_error);

          setTimeout(() => {
            setInput(_input || originalInput);
          });
        }
      }
    } catch (error) {
      logger.error('Error enhancing prompt:', error);
      toast.error('Error enhancing prompt');
      setEnhancingPrompt(false);
      setPromptEnhanced(false);
    }
  };

  return { enhancingPrompt, promptEnhanced, enhancePrompt, resetEnhancer };
}
