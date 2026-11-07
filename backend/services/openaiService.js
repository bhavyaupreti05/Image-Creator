import OpenAI from 'openai';
import { env } from '../config/env.js';

const openai = new OpenAI({ apiKey: env.openaiApiKey });

export const generateImage = async (prompt, options = {}) => {
  const {
    model = 'flux',
    aspectRatio = '1:1',
    negativePrompt = '',
  } = typeof options === 'string' ? { model: options } : options;

  let width = 1024;
  let height = 1024;
  let openAiSize = '1024x1024';

  if (aspectRatio === '9:16') {
    width = 768;
    height = 1360;
    openAiSize = '1024x1792';
  } else if (aspectRatio === '16:9') {
    width = 1360;
    height = 768;
    openAiSize = '1792x1024';
  }

  // 1. If OpenAI model requested and API key is present
  if (model === 'dall-e-3' && env.openaiApiKey) {
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        size: openAiSize,
        quality: 'standard',
      });

      const image = response.data?.[0]?.b64_json || response.data?.[0]?.url;
      if (image) {
        return image;
      }
    } catch (openAiError) {
      console.warn(`OpenAI image generation failed (${openAiError.message}). Falling back to multi-model diffusion engine.`);
    }
  }

  // 2. High-performance multi-model diffusion engine (Flux.1, Midjourney style, SDXL, Turbo)
  let pollinationsModel = 'flux';
  let enrichedPrompt = prompt.trim();

  if (model === 'midjourney') {
    pollinationsModel = 'flux';
    enrichedPrompt = `${enrichedPrompt}, midjourney v6 style, dramatic cinematic lighting, ultra-detailed textures, award-winning photography --stylize 800`;
  } else if (model === 'sdxl') {
    pollinationsModel = 'turbo';
    enrichedPrompt = `${enrichedPrompt}, 8k UHD, high dynamic range, masterpiece`;
  } else if (model === 'flux') {
    pollinationsModel = 'flux';
    enrichedPrompt = `${enrichedPrompt}, photorealistic, high fidelity`;
  }

  if (negativePrompt && negativePrompt.trim()) {
    enrichedPrompt = `${enrichedPrompt} [avoid: ${negativePrompt.trim()}]`;
  }

  const encodedPrompt = encodeURIComponent(enrichedPrompt);
  const seed = Math.floor(Math.random() * 999999);
  const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${pollinationsModel}&nologo=true&seed=${seed}`;
  return fallbackUrl;
};
