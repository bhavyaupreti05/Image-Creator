import express from 'express';
import { createPost, getPosts, searchPosts } from '../controllers/postController.js';

const router = express.Router();

router.get('/search', searchPosts);
router.get('/', getPosts);
router.post('/', createPost);

export default router;
