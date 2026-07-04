import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 80,
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
      trim: true,
      maxlength: 500,
    },
    photo: {
      type: String,
      required: [true, 'Photo URL is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Post', postSchema);
