import OpenAI from 'openai';
import { env } from '../config/env.js';

const openai = new OpenAI({ apiKey: env.openaiApiKey });

export const generateImage = async (prompt) => {
  const response = await openai.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024',
    quality: 'high',
  });

  return response.data?.[0]?.b64_json || response.data?.[0]?.url || null;
};
