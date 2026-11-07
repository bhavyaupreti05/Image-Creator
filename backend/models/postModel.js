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
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    styleTags: {
      type: [String],
      default: [],
    },
    parentId: {
      type: String,
      default: null,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    model: {
      type: String,
      default: 'Flux.1',
    },
    negativePrompt: {
      type: String,
      default: '',
    },
    aspectRatio: {
      type: String,
      default: '1:1',
    },
    recipePrice: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Post', postSchema);
