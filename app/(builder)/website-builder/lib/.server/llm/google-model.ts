import { GoogleGenAI } from '@google/genai';

export function getGoogleModel(apiKey: string) {
  const genAI = new GoogleGenAI({ apiKey });
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}
