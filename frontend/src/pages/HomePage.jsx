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
import { PlusIcon, HeartIcon } from '../components/Icons';
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
      toast.success('Removed from saved');
    } else {
      next = [post, ...savedPosts];
      toast.success('Saved to collection');
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
      toast.error(error?.response?.data?.message || 'Unable to load artworks');
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
        // silent rollback
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
      {/* Editorial Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-10"
      >
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-800/60 px-3 py-1 text-xs font-medium text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Community Exhibition
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Curated AI Artwork & Remix Engine
            </h1>

            <p className="text-sm sm:text-base leading-relaxed text-zinc-400">
              Discover high-fidelity generative pieces, inspect prompt lineage, compare prompt mutations, and craft your own variations.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/create"
                className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 active:scale-95 shadow-sm"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New Artwork</span>
              </Link>
              <a
                href="#gallery"
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                Browse Gallery ↓
              </a>
            </div>
          </div>

          {/* Understated Stats */}
          <div className="flex gap-4">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-3 min-w-[120px]">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Artworks
              </span>
              <p className="mt-0.5 text-xl font-semibold text-white">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-3 min-w-[120px]">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Appreciations
              </span>
              <div className="mt-0.5 flex items-center gap-1.5 text-xl font-semibold text-rose-400">
                <HeartIcon className="h-4 w-4 fill-rose-500" filled />
                <span>{stats.totalLikes}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Gallery & Controls */}
      <section id="gallery" className="space-y-5">
        {/* Search & Style Filter Bar */}
        <div className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 sm:p-4">
          <SearchBar value={search} onChange={setSearch} onSubmit={handleSearch} />
          <div className="pt-1 border-t border-zinc-800/60">
            <StyleFilter selected={selectedTag} onSelect={handleSelectTag} />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              <div className="col-span-full py-12">
                <EmptyState
                  title="No artworks found"
                  description="Try adjusting your search query or filter to discover community creations."
                />
              </div>
            )
          )}
        </div>

        {/* Loader */}
        {loading && <Loader />}

        {/* Load More Button */}
        {!loading && hasMore && posts.length > 0 && (
          <div className="flex justify-center pt-4 pb-6">
            <button
              onClick={loadMore}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-xs sm:text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              Load more artworks
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
