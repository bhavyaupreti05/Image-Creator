const inMemoryPosts = [
  {
    _id: 'seed-root-1',
    name: '@bhavya',
    prompt: 'A cyberpunk neo-tokyo alley drenched in rain with neon signs glowing in cyan and purple, octane render 8k',
    photo: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1080&q=80',
    likes: 24,
    styleTags: ['Cyberpunk', '3D Render'],
    parentId: null,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'seed-remix-1',
    name: '@elena',
    prompt: 'A cyberpunk neo-tokyo alley drenched in rain with glowing bioluminescent sakura trees and samurai hologram, anime aesthetic',
    photo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
    likes: 18,
    styleTags: ['Cyberpunk', 'Anime'],
    parentId: 'seed-root-1',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'seed-surreal-1',
    name: '@kai',
    prompt: 'Surreal floating chromatic glass monolith over a calm mirrored ocean at twilight, cinematic lighting, 8k',
    photo: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1080&q=80',
    likes: 42,
    styleTags: ['Surrealism', 'Cinematic'],
    parentId: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const detectStyleTags = (prompt = '') => {
  const p = prompt.toLowerCase();
  const tags = [];
  if (p.includes('cyberpunk') || p.includes('neon') || p.includes('futuristic')) tags.push('Cyberpunk');
  if (p.includes('anime') || p.includes('manga') || p.includes('ghibli')) tags.push('Anime');
  if (p.includes('oil') || p.includes('painting') || p.includes('canvas') || p.includes('renaissance')) tags.push('Oil Painting');
  if (p.includes('3d') || p.includes('render') || p.includes('octane') || p.includes('unreal')) tags.push('3D Render');
  if (p.includes('fantasy') || p.includes('mytholog') || p.includes('magic') || p.includes('dragon')) tags.push('Fantasy');
  if (p.includes('surreal') || p.includes('dream') || p.includes('psychedelic')) tags.push('Surrealism');
  if (p.includes('cinematic') || p.includes('photoreal') || p.includes('film') || p.includes('portrait')) tags.push('Cinematic');
  if (p.includes('minimal') || p.includes('clean') || p.includes('simple')) tags.push('Minimalist');
  if (tags.length === 0) tags.push('Digital Art');
  return tags;
};

export const getPostRecords = (tag = '') => {
  const all = [...inMemoryPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (!tag || tag === 'All') {
    return all;
  }
  const normalizedTag = tag.toLowerCase();
  return all.filter((post) => {
    return (
      post.styleTags?.some((t) => t.toLowerCase() === normalizedTag) ||
      post.prompt.toLowerCase().includes(normalizedTag)
    );
  });
};

export const searchPostRecords = (query) => {
  const normalized = query?.toLowerCase().trim();
  if (!normalized) {
    return [];
  }

  return getPostRecords().filter((post) => {
    return post.name.toLowerCase().includes(normalized) || post.prompt.toLowerCase().includes(normalized);
  });
};

export const likePostRecord = (id) => {
  const post = inMemoryPosts.find((p) => p._id === id);
  if (!post) return null;
  post.likes = (post.likes || 0) + 1;
  post.updatedAt = new Date().toISOString();
  return post;
};

export const createPostRecord = (payload) => {
  const styleTags = payload.styleTags?.length
    ? payload.styleTags
    : detectStyleTags(payload.prompt);

  const post = {
    _id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ...payload,
    likes: payload.likes ?? 0,
    styleTags,
    parentId: payload.parentId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryPosts.unshift(post);
  return post;
};

export const getPostLineage = (id) => {
  const currentPost = inMemoryPosts.find((p) => p._id === id);
  if (!currentPost) return null;

  // 1. Traverse Ancestors (upwards)
  const ancestors = [];
  let curr = currentPost;
  const visited = new Set([id]);
  while (curr.parentId && !visited.has(curr.parentId)) {
    visited.add(curr.parentId);
    const parent = inMemoryPosts.find((p) => p._id === curr.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    curr = parent;
  }

  // 2. Direct remixes (downwards)
  const remixes = inMemoryPosts.filter((p) => p.parentId === id);

  // 3. Count recursive descendants
  const getDescendantCount = (targetId) => {
    const direct = inMemoryPosts.filter((p) => p.parentId === targetId);
    let count = direct.length;
    for (const child of direct) {
      count += getDescendantCount(child._id);
    }
    return count;
  };

  const totalDescendants = getDescendantCount(id);

  return {
    post: currentPost,
    ancestors,
    remixes,
    generationDepth: ancestors.length + 1,
    totalDescendants,
    rootParent: ancestors.length > 0 ? ancestors[0] : currentPost,
  };
};

export const getCreatorProfile = (username) => {
  const normalized = username.toLowerCase().replace(/^@/, '').trim();
  const allPosts = inMemoryPosts.filter(
    (p) => p.name.toLowerCase().replace(/^@/, '').trim() === normalized,
  );

  const totalLikes = allPosts.reduce((acc, p) => acc + (p.likes || 0), 0);
  const creations = allPosts.filter((p) => !p.parentId);
  const remixes = allPosts.filter((p) => Boolean(p.parentId));

  return {
    creator: {
      username: username.startsWith('@') ? username : `@${username}`,
      displayName: username.replace(/^@/, ''),
      totalCreations: allPosts.length,
      totalLikes,
      totalRemixes: remixes.length,
      bio: 'Generative AI Creator & Digital Artist exploring latent space aesthetics.',
    },
    posts: allPosts,
    creations,
    remixes,
  };
};
