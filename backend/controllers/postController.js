import mongoose from 'mongoose';
import Post from '../models/postModel.js';
import { createPostRecord, getPostRecords, searchPostRecords, likePostRecord, getPostLineage, getCreatorProfile } from '../services/postStore.js';

const useFallbackStore = () => mongoose.connection.readyState !== 1;

export const getPosts = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const tag = req.query.tag?.toString().trim();

    if (useFallbackStore()) {
      const allPosts = getPostRecords(tag);
      const posts = allPosts.slice(skip, skip + limit);
      return res.status(200).json({
        success: true,
        posts,
        total: allPosts.length,
        page,
        pages: Math.ceil(allPosts.length / limit) || 1,
      });
    }

    const filter = {};
    if (tag && tag !== 'All') {
      filter.$or = [
        { styleTags: { $in: [new RegExp(tag, 'i')] } },
        { prompt: { $regex: tag, $options: 'i' } },
      ];
    }

    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      posts,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

export const searchPosts = async (req, res, next) => {
  try {
    const query = req.query.q?.toString().trim();

    if (!query) {
      return res.status(200).json({ success: true, posts: [] });
    }

    if (useFallbackStore()) {
      return res.status(200).json({ success: true, posts: searchPostRecords(query) });
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
    const { name, prompt, photo, parentId, styleTags } = req.body || {};

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

    const payload = {
      name: name.toString().trim(),
      prompt: prompt.toString().trim(),
      photo: photo.toString().trim(),
      parentId: parentId ? parentId.toString().trim() : null,
      styleTags: Array.isArray(styleTags) ? styleTags : undefined,
    };

    if (useFallbackStore()) {
      const post = createPostRecord(payload);
      return res.status(201).json({ success: true, post });
    }

    const post = await Post.create(payload);

    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      const error = new Error('Post ID is required');
      error.statusCode = 400;
      throw error;
    }

    if (useFallbackStore()) {
      const post = likePostRecord(id);
      if (!post) {
        const error = new Error('Post not found');
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({ success: true, likes: post.likes, post });
    }

    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, likes: post.likes, post });
  } catch (error) {
    next(error);
  }
};

export const getPostLineageController = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      const error = new Error('Post ID is required');
      error.statusCode = 400;
      throw error;
    }

    if (useFallbackStore()) {
      const lineage = getPostLineage(id);
      if (!lineage) {
        const error = new Error('Post not found');
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({ success: true, ...lineage });
    }

    const currentPost = await Post.findById(id);
    if (!currentPost) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    const ancestors = [];
    let currParentId = currentPost.parentId;
    const visited = new Set([id]);
    while (currParentId && !visited.has(currParentId)) {
      visited.add(currParentId);
      const parent = await Post.findById(currParentId);
      if (!parent) break;
      ancestors.unshift(parent);
      currParentId = parent.parentId;
    }

    const remixes = await Post.find({ parentId: id }).sort({ createdAt: -1 });
    const totalDescendants = await Post.countDocuments({ parentId: id });

    res.status(200).json({
      success: true,
      post: currentPost,
      ancestors,
      remixes,
      generationDepth: ancestors.length + 1,
      totalDescendants,
      rootParent: ancestors.length > 0 ? ancestors[0] : currentPost,
    });
  } catch (error) {
    next(error);
  }
};

export const getCreatorProfileController = async (req, res, next) => {
  try {
    const { username } = req.params;

    if (!username || !username.toString().trim()) {
      const error = new Error('Username is required');
      error.statusCode = 400;
      throw error;
    }

    if (useFallbackStore()) {
      const profile = getCreatorProfile(username);
      return res.status(200).json({ success: true, ...profile });
    }

    const cleanUsername = username.replace(/^@/, '').trim();
    const regex = new RegExp(`^@?${cleanUsername}$`, 'i');

    const allPosts = await Post.find({ name: { $regex: regex } }).sort({ createdAt: -1 });
    const totalLikes = allPosts.reduce((acc, p) => acc + (p.likes || 0), 0);
    const creations = allPosts.filter((p) => !p.parentId);
    const remixes = allPosts.filter((p) => Boolean(p.parentId));

    res.status(200).json({
      success: true,
      creator: {
        username: username.startsWith('@') ? username : `@${username}`,
        displayName: cleanUsername,
        totalCreations: allPosts.length,
        totalLikes,
        totalRemixes: remixes.length,
        bio: 'Generative AI Creator & Digital Artist exploring latent space aesthetics.',
      },
      posts: allPosts,
      creations,
      remixes,
    });
  } catch (error) {
    next(error);
  }
};
