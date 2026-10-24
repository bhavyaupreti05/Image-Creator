import { generateImage } from '../services/openaiService.js';
import { uploadImageToCloudinary } from '../services/cloudinaryService.js';
import { jobQueue } from '../services/jobQueue.js';

// Synchronous legacy endpoint
export const generateImageController = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.toString().trim()) {
      const error = new Error('Prompt is required');
      error.statusCode = 400;
      throw error;
    }

    const imageOutput = await generateImage(prompt.trim());

    if (!imageOutput) {
      const error = new Error('OpenAI did not return an image');
      error.statusCode = 502;
      throw error;
    }

    const uploadResult = await uploadImageToCloudinary(imageOutput, prompt.trim());

    res.status(200).json({ success: true, photo: uploadResult.secure_url });
  } catch (error) {
    next(error);
  }
};

// Asynchronous Job Submission (HTTP 202 Accepted)
export const createImageJobController = (req, res, next) => {
  try {
    const { prompt } = req.body || {};

    if (!prompt || !prompt.toString().trim()) {
      const error = new Error('Prompt is required');
      error.statusCode = 400;
      throw error;
    }

    const job = jobQueue.enqueueJob(prompt.toString().trim());

    res.status(202).json({
      success: true,
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      stage: job.stage,
      streamUrl: `/api/v1/images/jobs/${job.id}/stream`,
    });
  } catch (error) {
    next(error);
  }
};

// Server-Sent Events (SSE) Live Telemetry Stream
export const streamJobProgressController = (req, res) => {
  const { jobId } = req.params;
  const existingJob = jobQueue.getJob(jobId);

  if (!existingJob) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  // SSE response headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const unsubscribe = jobQueue.subscribe(jobId, (updatedJob) => {
    sendEvent(updatedJob);

    if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
      setTimeout(() => {
        unsubscribe();
        res.end();
      }, 500);
    }
  });

  req.on('close', () => {
    unsubscribe();
  });
};
