import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SearchBar from '../components/SearchBar';
import ImageCard from '../components/ImageCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { getPosts, searchPosts } from '../services/postService';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum = 1, query = '') => {
    setLoading(true);
    try {
      const data = query ? await searchPosts(query) : await getPosts(pageNum, 12);
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
    fetchPosts(1);
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    setPage(1);
    await fetchPosts(1, search.trim());
  };

  const loadMore = async () => {
    if (!hasMore || loading) {
      return;
    }
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPosts(nextPage);
  };

  const stats = useMemo(() => ({ total: posts.length }), [posts.length]);

  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/70 shadow-[0_20px_80px_rgba(2,8,23,0.35)]">
        <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:p-10">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-200">
              AI image studio
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Create polished visuals from a single idea.
            </h1>
            <p className="max-w-2xl text-lg text-slate-300">
              Describe a scene, generate an image, and publish it to a clean community gallery in seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/create" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Generate now
              </a>
              <a href="#gallery" className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
                View gallery
              </a>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-6">
            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Community posts</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stats.total}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Search ready</p>
                <p className="mt-2 text-3xl font-semibold text-white">Instant</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="space-y-6">
        <div className="rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-4 shadow-[0_16px_50px_rgba(2,8,23,0.2)]">
          <SearchBar value={search} onChange={setSearch} onSubmit={handleSearch} />
        </div>
        <div id="gallery" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.length > 0 ? posts.map((post) => <ImageCard key={post._id} post={post} />) : !loading && <EmptyState title="No posts yet" description="Be the first to create a striking image and share it with the community." />}
        </div>
        {loading && <Loader />}
        {!loading && hasMore && posts.length > 0 && (
          <div className="flex justify-center">
            <button onClick={loadMore} className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
              Load more
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
