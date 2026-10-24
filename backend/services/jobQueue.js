import { EventEmitter } from 'events';
import { generateImage } from './openaiService.js';
import { uploadImageToCloudinary } from './cloudinaryService.js';

class GenerationJobQueue {
  constructor() {
    this.jobs = new Map();
    this.queue = [];
    this.isProcessing = false;
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }

  updateJob(jobId, updates) {
    const job = this.jobs.get(jobId);
    if (!job) return;
    Object.assign(job, updates, { updatedAt: new Date().toISOString() });
    this.jobs.set(jobId, job);
    this.emitter.emit(`job:${jobId}`, job);
  }

  enqueueJob(prompt) {
    const cleanPrompt = prompt.trim();
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const job = {
      id: jobId,
      prompt: cleanPrompt,
      status: 'queued',
      progress: 15,
      stage: 'Request accepted & queued in generation pipeline',
      photo: null,
      error: null,
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);
    this.queue.push(jobId);

    // Trigger asynchronous queue processor
    setImmediate(() => this.processNext());

    return job;
  }

  async processNext() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const jobId = this.queue.shift();
    const job = this.jobs.get(jobId);

    if (!job) {
      this.isProcessing = false;
      return this.processNext();
    }

    try {
      // Stage 1: Synthesis
      this.updateJob(jobId, {
        status: 'synthesizing',
        progress: 45,
        stage: 'Synthesizing diffusion latent space...',
      });

      const imageOutput = await generateImage(job.prompt);

      if (!imageOutput) {
        throw new Error('Image generation provider did not return output');
      }

      // Stage 2: Cloudinary Upload & CDN Optimization
      this.updateJob(jobId, {
        status: 'optimizing',
        progress: 80,
        stage: 'Optimizing and streaming via Cloudinary edge CDN...',
      });

      const uploadResult = await uploadImageToCloudinary(imageOutput, job.prompt);

      // Stage 3: Completed
      this.updateJob(jobId, {
        status: 'completed',
        progress: 100,
        stage: 'Artwork synthesized successfully!',
        photo: uploadResult.secure_url,
      });
    } catch (error) {
      this.updateJob(jobId, {
        status: 'failed',
        progress: 0,
        stage: error.message || 'Generation failed',
        error: error.message || 'Unknown error occurred',
      });
    } finally {
      this.isProcessing = false;
      // Process next job in queue if any
      setImmediate(() => this.processNext());
    }
  }

  subscribe(jobId, listener) {
    const job = this.jobs.get(jobId);
    if (job) {
      listener(job);
    }

    const eventName = `job:${jobId}`;
    this.emitter.on(eventName, listener);

    return () => {
      this.emitter.off(eventName, listener);
    };
  }
}

export const jobQueue = new GenerationJobQueue();
