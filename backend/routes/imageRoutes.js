import express from 'express';
import {
  generateImageController,
  createImageJobController,
  streamJobProgressController,
} from '../controllers/imageController.js';

const router = express.Router();

router.post('/jobs', createImageJobController);
router.get('/jobs/:jobId/stream', streamJobProgressController);
router.post('/generate', generateImageController);

export default router;
