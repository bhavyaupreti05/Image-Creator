import cloudinary from '../config/cloudinary.js';

export const uploadImageToCloudinary = async (imageBuffer, prompt) => {
  const uploadResult = await cloudinary.uploader.upload_stream(
    {
      folder: 'ai-image-creator',
      resource_type: 'image',
      public_id: `${prompt.replace(/\s+/g, '-').slice(0, 40)}-${Date.now()}`,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
    (error, result) => {
      if (error) {
        throw error;
      }
      return result;
    },
  );

  return uploadResult;
};
