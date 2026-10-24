import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SearchBar from '../components/SearchBar';
import ImageCard from '../components/ImageCard';
import StyleFilter from '../components/StyleFilter';
import LightboxModal from '../components/LightboxModal';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { getPosts, searchPosts, likePost } from '../services/postService';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedMap, setLikedMap] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_liked_posts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [savedPosts, setSavedPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_saved_moodboard');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleBookmark = (post) => {
    const isSaved = savedPosts.some((p) => p._id === post._id);
    let next;
    if (isSaved) {
      next = savedPosts.filter((p) => p._id !== post._id);
      toast.success('Removed from Moodboard');
    } else {
      next = [post, ...savedPosts];
      toast.success('Saved to your Moodboard! 🔖');
    }
    setSavedPosts(next);
    localStorage.setItem('aura_saved_moodboard', JSON.stringify(next));
  };

  const fetchPosts = async (pageNum = 1, query = '', tag = 'All') => {
    setLoading(true);
    try {
      const data = query ? await searchPosts(query) : await getPosts(pageNum, 12, tag);
      const nextPosts = data.posts || [];
      setPosts((current) => (pageNum === 1 ? nextPosts : [...current, ...nextPosts]));
      setHasMore(query ? false : pageNum < (data.pages || 1));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, '', selectedTag);
  }, [selectedTag]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setPage(1);
    await fetchPosts(1, search.trim(), selectedTag);
  };

  const handleSelectTag = (tag) => {
    setSelectedTag(tag);
    setSearch('');
    setPage(1);
  };

  const handleLike = async (postId) => {
    const isAlreadyLiked = likedMap[postId];

    // Optimistically update post likes
    setPosts((current) =>
      current.map((p) => {
        if (p._id === postId) {
          const newLikes = isAlreadyLiked ? Math.max(0, (p.likes || 1) - 1) : (p.likes || 0) + 1;
          return { ...p, likes: newLikes };
        }
        return p;
      }),
    );

    if (selectedPost && selectedPost._id === postId) {
      setSelectedPost((prev) => ({
        ...prev,
        likes: isAlreadyLiked ? Math.max(0, (prev.likes || 1) - 1) : (prev.likes || 0) + 1,
      }));
    }

    const nextLikedMap = { ...likedMap, [postId]: !isAlreadyLiked };
    setLikedMap(nextLikedMap);
    try {
      localStorage.setItem('aura_liked_posts', JSON.stringify(nextLikedMap));
    } catch {
      // storage error ignored
    }

    if (!isAlreadyLiked) {
      try {
        await likePost(postId);
      } catch {
        // silent rollback if desired
      }
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) {
      return;
    }
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPosts(nextPage, search.trim(), selectedTag);
  };

  const stats = useMemo(() => {
    const totalLikes = posts.reduce((acc, p) => acc + (p.likes || 0), 0);
    return { total: posts.length, totalLikes };
  }, [posts]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 p-8 shadow-[0_20px_80px_rgba(2,8,23,0.4)] backdrop-blur lg:p-12"
      >
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Aura Generative Art Gallery
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Where AI Creators <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Exhibit & Remix</span>
            </h1>
            <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
              Explore hyper-aesthetic prompts, double-tap to like community masterpieces, and remix any prompt into your own variation with one click.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/create"
                className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-xl shadow-white/10 transition hover:bg-slate-100 hover:scale-105 active:scale-95"
              >
                ✨ Create Artwork
              </Link>
              <a
                href="#gallery"
                className="rounded-full border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                Explore Exhibition ↓
              </a>
            </div>
          </div>

          {/* Social Stats Counters */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-slate-800/90 bg-slate-950/60 p-5 shadow-inner">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Exhibition Pieces</span>
              <p className="mt-1 text-3xl font-extrabold text-white">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-slate-800/90 bg-slate-950/60 p-5 shadow-inner">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Community Hearts</span>
              <p className="mt-1 text-3xl font-extrabold text-rose-400">❤️ {stats.totalLikes}</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Gallery & Controls */}
      <section id="gallery" className="space-y-6 pt-4">
        {/* Search & Style Filter Bar */}
        <div className="space-y-4 rounded-[2rem] border border-slate-800/80 bg-slate-900/70 p-5 shadow-xl backdrop-blur">
          <SearchBar value={search} onChange={setSearch} onSubmit={handleSearch} />
          <StyleFilter selected={selectedTag} onSelect={handleSelectTag} />
        </div>

        {/* Gallery Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <ImageCard
                key={post._id}
                post={post}
                onClick={setSelectedPost}
                onLike={handleLike}
                isLiked={Boolean(likedMap[post._id])}
                onBookmark={handleToggleBookmark}
                isSaved={savedPosts.some((p) => p._id === post._id)}
              />
            ))
          ) : (
            !loading && (
              <div className="col-span-full py-10">
                <EmptyState
                  title="No artworks found"
                  description="Be the first to create and publish a stunning masterpiece in this aesthetic."
                />
              </div>
            )
          )}
        </div>

        {/* Loader */}
        {loading && <Loader />}

        {/* Load More Button */}
        {!loading && hasMore && posts.length > 0 && (
          <div className="flex justify-center pt-6">
            <button
              onClick={loadMore}
              className="rounded-full border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
            >
              Load more pieces
            </button>
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {selectedPost && (
        <LightboxModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          isLiked={Boolean(likedMap[selectedPost._id])}
          onSelectPost={setSelectedPost}
          onBookmark={handleToggleBookmark}
          isSaved={savedPosts.some((p) => p._id === selectedPost._id)}
        />
      )}
    </div>
  );
};

export default HomePage;
