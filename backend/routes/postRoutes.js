import express from 'express';
import {
  createPost,
  getPosts,
  searchPosts,
  likePost,
  getPostLineageController,
  getCreatorProfileController,
} from '../controllers/postController.js';

const router = express.Router();

router.get('/search', searchPosts);
router.get('/creator/:username', getCreatorProfileController);
router.get('/:id/lineage', getPostLineageController);
router.get('/', getPosts);
router.post('/', createPost);
router.patch('/:id/like', likePost);
router.post('/:id/like', likePost);

export default router;
