const inMemoryPosts = [
  {
    _id: 'seed-root-1',
    name: '@bhavya',
    prompt: 'Futuristic neo-Tokyo rain-soaked boulevard with glowing neon holographic signs and reflections, cinematic 8k',
    photo: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1080&q=80',
    likes: 48,
    styleTags: ['Cyberpunk', 'Cinematic'],
    parentId: null,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: 'seed-remix-1',
    name: '@elena',
    prompt: 'Futuristic neo-Tokyo rain-soaked boulevard with glowing neon holographic signs and bioluminescent pink sakura blossoms, anime aesthetic',
    photo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
    likes: 37,
    styleTags: ['Cyberpunk', 'Anime'],
    parentId: 'seed-root-1',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    _id: 'seed-remix-2',
    name: '@chloe',
    prompt: 'Futuristic neo-Tokyo rain-soaked boulevard with anime mecha pilot wearing reflective visor under glowing sakura branches',
    photo: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1080&q=80',
    likes: 27,
    styleTags: ['Anime', 'Cyberpunk'],
    parentId: 'seed-remix-1',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    _id: 'seed-surreal-1',
    name: '@kai',
    prompt: 'Surreal floating chromatic glass monolith over a calm mirrored ocean at twilight, cinematic lighting, 8k render',
    photo: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1080&q=80',
    likes: 62,
    styleTags: ['Surrealism', 'Cinematic'],
    parentId: null,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    _id: 'seed-surreal-2',
    name: '@elena',
    prompt: 'Surreal melting gold timepieces suspended over endless mirror dunes in quiet lavender twilight, high detail dreamscape',
    photo: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1080&q=80',
    likes: 38,
    styleTags: ['Surrealism', 'Minimalist'],
    parentId: 'seed-surreal-1',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    _id: 'seed-minimal-1',
    name: '@maya',
    prompt: 'Brutalist concrete pavilion with curved arches overlooking a misty bamboo courtyard, warm sunlight shadows, minimalist architectural photography',
    photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1080&q=80',
    likes: 51,
    styleTags: ['Minimalist', 'Cinematic'],
    parentId: null,
    createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 16).toISOString(),
  },
  {
    _id: 'seed-3d-1',
    name: '@zane',
    prompt: 'Abstract iridescent liquid metal sculpture suspended in dark obsidian void, soft pastel refractions, octane 3d render',
    photo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
    likes: 54,
    styleTags: ['3D Render', 'Minimalist'],
    parentId: null,
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    _id: 'seed-fantasy-1',
    name: '@arjun',
    prompt: 'Gothic fortress perched on a jagged obsidian cliff above glowing stormy clouds, dramatic lightning, dark fantasy concept art',
    photo: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=80',
    likes: 41,
    styleTags: ['Fantasy', 'Cinematic'],
    parentId: null,
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    _id: 'seed-oil-1',
    name: '@sophia',
    prompt: 'Lyrical oil painting of a solitary wanderer in a golden wheatfield at sundown, rich palette knife impasto texture, impressionist',
    photo: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1080&q=80',
    likes: 33,
    styleTags: ['Oil Painting'],
    parentId: null,
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    _id: 'seed-space-1',
    name: '@bhavya',
    prompt: 'Astronaut walking barefoot on glowing violet bioluminescent sand beneath two crescent moons, wide angle, photorealistic film still',
    photo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1080&q=80',
    likes: 76,
    styleTags: ['Cinematic', '3D Render'],
    parentId: null,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    _id: 'seed-sphere-1',
    name: '@maya',
    prompt: 'Monolithic matte black sphere resting on stark white marble platform under pale northern fog, Scandinavian architectural minimalism',
    photo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1080&q=80',
    likes: 22,
    styleTags: ['Minimalist', '3D Render'],
    parentId: null,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'seed-crystal-1',
    name: '@arjun',
    prompt: 'Vast underground cavern with towering amethyst crystals radiating soft purple light over an ancient stone bridge, fantasy illustration',
    photo: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=80',
    likes: 45,
    styleTags: ['Fantasy', 'Oil Painting'],
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
  if (p.includes('fantasy') || p.includes('mytholog') || p.includes('magic') || p.includes('dragon') || p.includes('crystal')) tags.push('Fantasy');
  if (p.includes('surreal') || p.includes('dream') || p.includes('psychedelic')) tags.push('Surrealism');
  if (p.includes('cinematic') || p.includes('photoreal') || p.includes('film') || p.includes('portrait')) tags.push('Cinematic');
  if (p.includes('minimal') || p.includes('clean') || p.includes('simple')) tags.push('Minimalist');
  if (tags.length === 0) tags.push('Digital Art');
  return tags;
};

export const getPostRecords = (tag = '', author = '') => {
  const all = [...inMemoryPosts]
    .filter((p) => !p.isPrivate || (author && p.name.toLowerCase() === author.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
