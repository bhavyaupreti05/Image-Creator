import OpenAI from 'openai';
import { env } from '../config/env.js';

const openai = new OpenAI({ apiKey: env.openaiApiKey });

export const generateImage = async (prompt) => {
  try {
    if (env.openaiApiKey) {
      const response = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024',
        quality: 'high',
      });

      const image = response.data?.[0]?.b64_json || response.data?.[0]?.url;
      if (image) {
        return image;
      }
    }
  } catch (openAiError) {
    console.warn(`OpenAI image generation failed (${openAiError.message}). Using AI fallback generator.`);
  }

  // Graceful fallback to Pollinations AI when OpenAI quota/credits are exhausted
  const encodedPrompt = encodeURIComponent(prompt.trim());
  const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
  return fallbackUrl;
};
