import { generateImage } from '../services/openaiService.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export const generateImageController = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.toString().trim()) {
      const error = new Error('Prompt is required');
      error.statusCode = 400;
      throw error;
    }

    const base64Image = await generateImage(prompt.trim());

    if (!base64Image) {
      const error = new Error('OpenAI did not return an image');
      error.statusCode = 502;
      throw error;
    }

    const data = Buffer.from(base64Image, 'base64');
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ai-image-creator',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          next(error);
          return;
        }

        res.status(200).json({ success: true, photo: result.secure_url });
      },
    );

    const readable = Readable.from(data);
    readable.pipe(uploadStream);
  } catch (error) {
    next(error);
  }
};
