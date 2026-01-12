import { type NextRequest } from 'next/server';
import { streamText } from '@/app/(builder)/website-builder/lib/.server/llm';

export async function POST(request: NextRequest) {
  const { message, provider = 'google' } = (await request.json()) as {
    message: string;
    provider?: string;
  };

  const env = {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    OPEN_AI: process.env.OPEN_AI,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  };

  try {
    const result = await streamText(
      [
        {
          role: 'user',
          content: `You are a professional prompt engineer. Enhance the following prompt to be more specific, structured, and effective for code generation. Return ONLY the enhanced prompt as plain text, without any formatting markers, prefixes, or explanations.

Original prompt: "${message}"

Enhanced prompt:`,
        },
      ],
      env as any,
      provider as any
    );

    const stream = result.toDataStreamResponse().body;

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error in prompt enhancer:', error);

    return new Response('Error enhancing prompt', {
      status: 500,
    });
  }
}
