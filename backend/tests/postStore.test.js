import test from 'node:test';
import assert from 'node:assert/strict';
import { createPostRecord, getPostRecords, searchPostRecords } from '../services/postStore.js';

test('fallback store creates and retrieves posts without a database connection', () => {
  const posts = getPostRecords();
  assert.deepEqual(posts, []);

  const created = createPostRecord({ name: 'Ada', prompt: 'A glowing city', photo: 'https://example.com/image.png' });

  assert.equal(created.name, 'Ada');
  assert.equal(created.prompt, 'A glowing city');
  assert.equal(getPostRecords().length, 1);
  assert.equal(searchPostRecords('glowing').length, 1);
});
