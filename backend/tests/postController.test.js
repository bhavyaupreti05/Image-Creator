import test from 'node:test';
import assert from 'node:assert/strict';
import { createPost } from '../controllers/postController.js';

test('createPost rejects request when name is missing', async () => {
  const req = { body: { prompt: 'A glowing sun', photo: 'https://example.com/p.jpg' } };
  let errorCaught = null;
  const next = (err) => {
    errorCaught = err;
  };
  const res = {
    status: () => res,
    json: () => {},
  };

  await createPost(req, res, next);
  assert.ok(errorCaught);
  assert.equal(errorCaught.statusCode, 400);
  assert.equal(errorCaught.message, 'Name is required');
});

test('createPost rejects request when prompt is missing', async () => {
  const req = { body: { name: 'Ada', photo: 'https://example.com/p.jpg' } };
  let errorCaught = null;
  const next = (err) => {
    errorCaught = err;
  };
  const res = {
    status: () => res,
    json: () => {},
  };

  await createPost(req, res, next);
  assert.ok(errorCaught);
  assert.equal(errorCaught.statusCode, 400);
  assert.equal(errorCaught.message, 'Prompt is required');
});

test('createPost rejects request when photo is missing', async () => {
  const req = { body: { name: 'Ada', prompt: 'A glowing sun' } };
  let errorCaught = null;
  const next = (err) => {
    errorCaught = err;
  };
  const res = {
    status: () => res,
    json: () => {},
  };

  await createPost(req, res, next);
  assert.ok(errorCaught);
  assert.equal(errorCaught.statusCode, 400);
  assert.equal(errorCaught.message, 'Photo URL is required');
});

test('likePost increments likes count on fallback store post', async () => {
  let createdPost = null;
  const createReq = { body: { name: 'Ada', prompt: 'A neon cyberpunk city in rain', photo: 'https://example.com/p.jpg' } };
  const createRes = {
    status: () => createRes,
    json: (data) => { createdPost = data.post; },
  };
  await createPost(createReq, createRes, () => {});
  assert.ok(createdPost);
  assert.equal(createdPost.likes, 0);
  assert.ok(createdPost.styleTags.includes('Cyberpunk'));

  let likeResult = null;
  const likeReq = { params: { id: createdPost._id } };
  const likeRes = {
    status: () => likeRes,
    json: (data) => { likeResult = data; },
  };
  const { likePost } = await import('../controllers/postController.js');
  await likePost(likeReq, likeRes, () => {});
  assert.ok(likeResult);
  assert.equal(likeResult.likes, 1);
});

test('getPostLineageController correctly traces DAG ancestors and direct remixes', async () => {
  const { getPostLineageController } = await import('../controllers/postController.js');

  // Create Parent A
  let postA = null;
  await createPost(
    { body: { name: 'Root Creator', prompt: 'Original ancient castle', photo: 'https://example.com/a.jpg' } },
    { status: () => ({ json: (d) => { postA = d.post; } }) },
    () => {}
  );

  // Create Child B (Remix of A)
  let postB = null;
  await createPost(
    { body: { name: 'Remixer One', prompt: 'Original ancient castle in neon cyberpunk style', photo: 'https://example.com/b.jpg', parentId: postA._id } },
    { status: () => ({ json: (d) => { postB = d.post; } }) },
    () => {}
  );

  // Create Grandchild C (Remix of B)
  let postC = null;
  await createPost(
    { body: { name: 'Remixer Two', prompt: 'Original ancient castle in neon cyberpunk style 3D render', photo: 'https://example.com/c.jpg', parentId: postB._id } },
    { status: () => ({ json: (d) => { postC = d.post; } }) },
    () => {}
  );

  let lineageResult = null;
  await getPostLineageController(
    { params: { id: postC._id } },
    { status: () => ({ json: (d) => { lineageResult = d; } }) },
    () => {}
  );

  assert.ok(lineageResult);
  assert.equal(lineageResult.generationDepth, 3);
  assert.equal(lineageResult.ancestors.length, 2);
  assert.equal(lineageResult.ancestors[0]._id, postA._id);
  assert.equal(lineageResult.ancestors[1]._id, postB._id);
  assert.equal(lineageResult.rootParent._id, postA._id);
});

test('getCreatorProfileController returns aggregated creator stats and posts', async () => {
  const { getCreatorProfileController } = await import('../controllers/postController.js');

  await createPost(
    { body: { name: 'AriaArtist', prompt: 'Cosmic nebula goddess', photo: 'https://example.com/aria1.jpg' } },
    { status: () => ({ json: () => {} }) },
    () => {}
  );

  let profileResult = null;
  await getCreatorProfileController(
    { params: { username: 'AriaArtist' } },
    { status: () => ({ json: (d) => { profileResult = d; } }) },
    () => {}
  );

  assert.ok(profileResult);
  assert.equal(profileResult.success, true);
  assert.equal(profileResult.creator.displayName, 'AriaArtist');
  assert.ok(profileResult.posts.length >= 1);
});
