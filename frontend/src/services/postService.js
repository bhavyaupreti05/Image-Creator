import api from './api';

export const getPosts = async (page = 1, limit = 12) => {
  const response = await api.get(`/posts?page=${page}&limit=${limit}`);
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
