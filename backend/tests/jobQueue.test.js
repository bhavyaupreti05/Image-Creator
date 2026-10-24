import test from 'node:test';
import assert from 'node:assert/strict';
import { jobQueue } from '../services/jobQueue.js';
import { createImageJobController } from '../controllers/imageController.js';

test('createImageJobController rejects empty prompt with 400', () => {
  let errorCaught = null;
  const req = { body: { prompt: '' } };
  const res = { status: () => res, json: () => {} };
  const next = (err) => { errorCaught = err; };

  createImageJobController(req, res, next);
  assert.ok(errorCaught);
  assert.equal(errorCaught.statusCode, 400);
});

test('createImageJobController enqueues job and returns 202 with telemetry', () => {
  let statusResult = null;
  let jsonResult = null;
  const req = { body: { prompt: 'A neon futuristic car' } };
  const res = {
    status: (s) => { statusResult = s; return res; },
    json: (d) => { jsonResult = d; },
  };

  createImageJobController(req, res, () => {});
  assert.equal(statusResult, 202);
  assert.ok(jsonResult);
  assert.equal(jsonResult.success, true);
  assert.ok(jsonResult.jobId);
  assert.equal(jsonResult.status, 'queued');
  assert.ok(jsonResult.streamUrl.includes(jsonResult.jobId));
});

test('jobQueue manages lifecycle and notifies subscribers', (t, done) => {
  const job = jobQueue.enqueueJob('A serene zen garden in snow');
  assert.ok(job.id);

  let stagesRecorded = [];
  const unsubscribe = jobQueue.subscribe(job.id, (state) => {
    stagesRecorded.push(state.status);
    if (state.status === 'completed' || state.status === 'failed') {
      unsubscribe();
      assert.ok(stagesRecorded.includes('queued'));
      done();
    }
  });
});
