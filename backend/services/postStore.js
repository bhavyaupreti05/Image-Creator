const inMemoryPosts = [];

export const getPostRecords = () => [...inMemoryPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const searchPostRecords = (query) => {
  const normalized = query?.toLowerCase().trim();
  if (!normalized) {
    return [];
  }

  return getPostRecords().filter((post) => {
    return post.name.toLowerCase().includes(normalized) || post.prompt.toLowerCase().includes(normalized);
  });
};

export const createPostRecord = (payload) => {
  const post = {
    _id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryPosts.unshift(post);
  return post;
};
