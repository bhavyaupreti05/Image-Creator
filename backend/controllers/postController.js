import mongoose from 'mongoose';
import Post from '../models/postModel.js';
import { createPostRecord, getPostRecords, searchPostRecords } from '../services/postStore.js';

const useFallbackStore = () => mongoose.connection.readyState !== 1;

export const getPosts = async (req, res, next) => {
  try {
    if (useFallbackStore()) {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 12;
      const skip = (page - 1) * limit;
      const posts = getPostRecords().slice(skip, skip + limit);
      return res.status(200).json({ success: true, posts, total: getPostRecords().length, page, pages: Math.ceil(getPostRecords().length / limit) });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      posts,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const searchPosts = async (req, res, next) => {
  try {
    if (useFallbackStore()) {
      const query = req.query.q?.toString().trim();
      return res.status(200).json({ success: true, posts: searchPostRecords(query) });
    }

    const query = req.query.q?.toString().trim();

    if (!query) {
      return res.status(200).json({ success: true, posts: [] });
    }

    const posts = await Post.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { prompt: { $regex: query, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { name, prompt, photo } = req.body;

    if (useFallbackStore()) {
      const post = createPostRecord({ name: name.trim(), prompt: prompt.trim(), photo: photo.trim() });
      return res.status(201).json({ success: true, post });
    }

    if (!name || !name.toString().trim()) {
      const error = new Error('Name is required');
      error.statusCode = 400;
      throw error;
    }

    if (!prompt || !prompt.toString().trim()) {
      const error = new Error('Prompt is required');
      error.statusCode = 400;
      throw error;
    }

    if (!photo || !photo.toString().trim()) {
      const error = new Error('Photo URL is required');
      error.statusCode = 400;
      throw error;
    }

    const post = await Post.create({
      name: name.trim(),
      prompt: prompt.trim(),
      photo: photo.trim(),
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};
