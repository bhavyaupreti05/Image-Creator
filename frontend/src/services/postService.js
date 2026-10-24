import api from './api';

export const getPosts = async (page = 1, limit = 12, tag = '') => {
  const tagParam = tag && tag !== 'All' ? `&tag=${encodeURIComponent(tag)}` : '';
  const response = await api.get(`/posts?page=${page}&limit=${limit}${tagParam}`);
  return response.data;
};

export const likePost = async (id) => {
  const response = await api.patch(`/posts/${id}/like`);
  return response.data;
};

export const getPostLineage = async (id) => {
  const response = await api.get(`/posts/${id}/lineage`);
  return response.data;
};

export const getCreatorProfile = async (username) => {
  const response = await api.get(`/posts/creator/${encodeURIComponent(username)}`);
  return response.data;
};

export const searchPosts = async (query) => {
  const response = await api.get(`/posts/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const createPost = async (payload) => {
  const response = await api.post('/posts', payload);
  return response.data;
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
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
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
      console.error('SSE parse error', err);
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
