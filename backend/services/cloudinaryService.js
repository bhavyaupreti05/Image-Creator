import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export const uploadImageToCloudinary = (source, prompt = 'generated-image') => {
  const cleanPrompt = prompt.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40) || 'image';
  const options = {
    folder: 'ai-image-creator',
    resource_type: 'image',
    public_id: `${cleanPrompt}-${Date.now()}`,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  };

  if (typeof source === 'string' && source.startsWith('http')) {
    return cloudinary.uploader.upload(source, options);
  }

  const buffer = Buffer.isBuffer(source) ? source : Buffer.from(source, 'base64');
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    Readable.from(buffer).pipe(uploadStream);
  });
};
