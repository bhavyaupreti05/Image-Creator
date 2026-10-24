import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ImageCard from '../components/ImageCard';
import LightboxModal from '../components/LightboxModal';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { getCreatorProfile, likePost } from '../services/postService';

const ProfilePage = () => {
  const { username = 'bhavya' } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('creations');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [savedPosts, setSavedPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_saved_moodboard');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [likedMap, setLikedMap] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_liked_posts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getCreatorProfile(username);
        setProfileData(data);
      } catch {
        toast.error('Could not load creator profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleLike = async (postId) => {
    const isAlreadyLiked = likedMap[postId];
    const nextLikedMap = { ...likedMap, [postId]: !isAlreadyLiked };
    setLikedMap(nextLikedMap);
    try {
      localStorage.setItem('aura_liked_posts', JSON.stringify(nextLikedMap));
    } catch {
      // ignore
    }

    if (!isAlreadyLiked) {
      try {
        await likePost(postId);
      } catch {
        // silent
      }
    }
  };

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

  const handleFollowToggle = () => {
    setIsFollowing((prev) => !prev);
    toast.success(!isFollowing ? `Following @${username}` : `Unfollowed @${username}`);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    );
  }

  const creator = profileData?.creator || {
    displayName: username,
    username: `@${username}`,
    totalCreations: 0,
    totalLikes: 0,
    totalRemixes: 0,
    bio: 'Generative AI Creator exploring prompt latent spaces.',
  };

  const creations = profileData?.creations || [];
  const remixes = profileData?.remixes || [];

  const displayedPosts =
    activeTab === 'creations'
      ? creations
      : activeTab === 'remixes'
      ? remixes
      : savedPosts;

  const creatorInitial = creator.displayName?.[0]?.toUpperCase() || 'A';

  return (
    <div className="space-y-8">
      {/* Creator Profile Header Card */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/80 p-6 shadow-2xl backdrop-blur sm:p-10"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Avatar & Bio */}
          <div className="flex items-center gap-5">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 text-2xl font-black text-white shadow-xl shadow-cyan-500/20 sm:h-24 sm:w-24">
              {creatorInitial}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-500 text-[10px] text-white">
                ✓
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                  {creator.displayName}
                </h1>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                  {creator.username}
                </span>
              </div>
              <p className="max-w-md text-xs text-slate-400 sm:text-sm">{creator.bio}</p>
            </div>
          </div>

          {/* Action Buttons & Follow Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleFollowToggle}
              className={`rounded-full px-6 py-2.5 text-xs font-bold transition active:scale-95 ${
                isFollowing
                  ? 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-white text-slate-950 shadow-lg shadow-white/10 hover:bg-slate-100'
              }`}
            >
              {isFollowing ? '✓ Following' : '+ Follow Creator'}
            </button>
            <Link
              to="/create"
              className="rounded-full border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Synthesize Art
            </Link>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-8 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-6 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Artworks</span>
            <p className="mt-1 text-2xl font-bold text-white">{creator.totalCreations}</p>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Remix Branches</span>
            <p className="mt-1 text-2xl font-bold text-indigo-400">{creator.totalRemixes}</p>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hearts Received</span>
            <p className="mt-1 text-2xl font-bold text-rose-400">❤️ {creator.totalLikes}</p>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Saved Moodboard</span>
            <p className="mt-1 text-2xl font-bold text-cyan-400">🔖 {savedPosts.length}</p>
          </div>
        </div>
      </motion.section>

      {/* Exhibition Gallery & Tabs */}
      <section className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('creations')}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition ${
              activeTab === 'creations'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Original Creations</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              {creations.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('remixes')}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition ${
              activeTab === 'remixes'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Remix Branches</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              {remixes.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition ${
              activeTab === 'saved'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🔖 Saved Moodboard</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              {savedPosts.length}
            </span>
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedPosts.length > 0 ? (
            displayedPosts.map((post) => (
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
            <div className="col-span-full py-16">
              <EmptyState
                title={
                  activeTab === 'saved'
                    ? 'Your Moodboard is empty'
                    : 'No artworks in this exhibition yet'
                }
                description={
                  activeTab === 'saved'
                    ? 'Click the bookmark ribbon 🔖 on any artwork in the gallery to save it to your private moodboard.'
                    : 'Synthesize your first visual concept and exhibit it here.'
                }
              />
            </div>
          )}
        </div>
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

export default ProfilePage;
