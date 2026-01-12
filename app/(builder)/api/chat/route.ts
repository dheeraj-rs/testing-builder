import { type NextRequest } from 'next/server';
import {
  MAX_RESPONSE_SEGMENTS,
  MAX_TOKENS,
  streamText,
  type Messages,
  type AIProvider,
  SwitchableStream,
} from '@/app/(builder)/website-builder/lib/.server/llm';

const CONTINUE_PROMPT =
  'Continue your response from exactly where you left off.';

export async function POST(request: NextRequest) {
  console.time('[API_CHAT] Total Request Time');

  try {
    const { messages, provider } = (await request.json()) as {
      messages: Messages;
      provider?: AIProvider;
    };

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('[API_CHAT] Invalid messages:', messages);
      return new Response(
        JSON.stringify({
          error: 'Messages array is required and must not be empty',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[API_CHAT] Provider:', provider || 'anthropic');
    console.log('[API_CHAT] Message count:', messages.length);

    const stream = new SwitchableStream();

    const options = {
      onFinish: async ({ text: content, finishReason }: any) => {
        console.log('[API_CHAT] Stream finished, reason:', finishReason);

        if (finishReason !== 'length') {
          return stream.close();
        }

        if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
          throw Error('Cannot continue message: Maximum segments reached');
        }

        const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;

        console.log(
          `[API_CHAT] Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`
        );

        messages.push({ role: 'assistant', content });
        messages.push({ role: 'user', content: CONTINUE_PROMPT });

        // Get environment variables from Next.js
        const env = {
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
          GOOGLE_GENERATIVE_AI_API_KEY:
            process.env.GOOGLE_GENERATIVE_AI_API_KEY,
          OPEN_AI: process.env.OPEN_AI,
          OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        };

        const result = await streamText(
          messages,
          env as any,
          provider,
          options
        );

        return stream.switchSource(result.toDataStreamResponse().body!);
      },
    };

    console.time('[API_CHAT] Stream Text Init');

    // Get environment variables from Next.js
    const env = {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      OPEN_AI: process.env.OPEN_AI,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    };

    const result = await streamText(messages, env as any, provider, options);
    console.timeEnd('[API_CHAT] Stream Text Init');

    stream.switchSource(result.toDataStreamResponse().body!);

    console.timeEnd('[API_CHAT] Total Request Time');

    return new Response(stream.readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('[API_CHAT] Error:', error);

    return new Response(null, {
      status: 500,
      statusText: error?.message || 'Internal Server Error',
    });
  }
}
