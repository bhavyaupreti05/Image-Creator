import api, { getBaseApiUrl } from './api';
import { MOCK_ARTWORKS } from '../data/mockArtworks';

const filterMockPosts = (tag = '', query = '') => {
  let list = [...MOCK_ARTWORKS];
  if (tag && tag !== 'All') {
    const t = tag.toLowerCase();
    list = list.filter(
      (p) =>
        p.styleTags?.some((st) => st.toLowerCase() === t) ||
        p.prompt.toLowerCase().includes(t),
    );
  }
  if (query) {
    const q = query.toLowerCase().trim();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.prompt.toLowerCase().includes(q),
    );
  }
  return list;
};

export const getPosts = async (page = 1, limit = 12, tag = '') => {
  const tagParam = tag && tag !== 'All' ? `&tag=${encodeURIComponent(tag)}` : '';
  try {
    const response = await api.get(`/posts?page=${page}&limit=${limit}${tagParam}`);
    if (response.data?.posts && response.data.posts.length > 0) {
      return response.data;
    }
  } catch (err) {
    console.warn('API getPosts error, falling back to mock dataset:', err.message);
  }

  // Graceful fallback to rich mock data
  const filtered = filterMockPosts(tag);
  const skip = (page - 1) * limit;
  return {
    success: true,
    posts: filtered.slice(skip, skip + limit),
    total: filtered.length,
    page,
    pages: Math.ceil(filtered.length / limit) || 1,
  };
};

export const likePost = async (id) => {
  try {
    const response = await api.patch(`/posts/${id}/like`);
    return response.data;
  } catch {
    const mock = MOCK_ARTWORKS.find((p) => p._id === id);
    if (mock) mock.likes = (mock.likes || 0) + 1;
    return { success: true, post: mock };
  }
};

export const getPostLineage = async (id) => {
  try {
    const response = await api.get(`/posts/${id}/lineage`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn('API getPostLineage error, using mock traversal:', err.message);
  }

  // Fallback lineage tree
  const currentPost = MOCK_ARTWORKS.find((p) => p._id === id) || MOCK_ARTWORKS[0];
  const ancestors = [];
  let curr = currentPost;
  const visited = new Set([id]);
  while (curr.parentId && !visited.has(curr.parentId)) {
    visited.add(curr.parentId);
    const parent = MOCK_ARTWORKS.find((p) => p._id === curr.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    curr = parent;
  }
  const remixes = MOCK_ARTWORKS.filter((p) => p.parentId === id);

  return {
    post: currentPost,
    ancestors,
    remixes,
    generationDepth: ancestors.length + 1,
    totalDescendants: remixes.length,
    rootParent: ancestors.length > 0 ? ancestors[0] : currentPost,
  };
};

export const getCreatorProfile = async (username) => {
  try {
    const response = await api.get(`/posts/creator/${encodeURIComponent(username)}`);
    if (response.data?.creator) return response.data;
  } catch (err) {
    console.warn('API getCreatorProfile error, using mock profile:', err.message);
  }

  const clean = username.toLowerCase().replace(/^@/, '').trim();
  const matched = MOCK_ARTWORKS.filter(
    (p) => p.name.toLowerCase().replace(/^@/, '').trim() === clean,
  );
  const userPosts = matched.length > 0 ? matched : [MOCK_ARTWORKS[0]];

  return {
    creator: {
      username: username.startsWith('@') ? username : `@${username}`,
      displayName: clean,
      totalCreations: userPosts.length,
      totalLikes: userPosts.reduce((acc, p) => acc + (p.likes || 0), 0),
      totalRemixes: userPosts.filter((p) => p.parentId).length,
      bio: 'Generative AI Creator exploring prompt latent spaces.',
    },
    posts: userPosts,
    creations: userPosts.filter((p) => !p.parentId),
    remixes: userPosts.filter((p) => p.parentId),
  };
};

export const searchPosts = async (query) => {
  try {
    const response = await api.get(`/posts/search?q=${encodeURIComponent(query)}`);
    if (response.data?.posts && response.data.posts.length > 0) {
      return response.data;
    }
  } catch (err) {
    console.warn('API searchPosts error, using mock search:', err.message);
  }

  return {
    success: true,
    posts: filterMockPosts('', query),
  };
};

export const createPost = async (payload) => {
  try {
    const response = await api.post('/posts', payload);
    return response.data;
  } catch {
    const newPost = {
      _id: `post-${Date.now()}`,
      ...payload,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    MOCK_ARTWORKS.unshift(newPost);
    return { success: true, post: newPost };
  }
};

export const generateImage = async (prompt) => {
  const response = await api.post('/images/generate', { prompt });
  return response.data;
};

export const createGenerationJob = async (prompt) => {
  const response = await api.post('/images/jobs', { prompt });
  return response.data;
};

export const streamJobProgress = (jobId, onProgress, onComplete, onError) => {
  const baseUrl = getBaseApiUrl();
  const eventSource = new EventSource(`${baseUrl}/images/jobs/${jobId}/stream`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onProgress) onProgress(data);

      if (data.status === 'completed') {
        eventSource.close();
        if (onComplete) onComplete(data);
      } else if (data.status === 'failed') {
        eventSource.close();
        if (onError) onError(new Error(data.error || 'Generation failed'));
      }
    } catch (err) {
      console.error('SSE JSON parse failed', err);
    }
  };

  eventSource.onerror = (err) => {
    eventSource.close();
    if (onError) onError(err);
  };

  return () => {
    eventSource.close();
  };
};
