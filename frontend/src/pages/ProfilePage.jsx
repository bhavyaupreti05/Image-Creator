import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ImageCard from '../components/ImageCard';
import LightboxModal from '../components/LightboxModal';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { BookmarkIcon, BranchIcon, HeartIcon, PlusIcon } from '../components/Icons';
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
      toast.success('Removed from saved');
    } else {
      next = [post, ...savedPosts];
      toast.success('Saved to collection');
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
    bio: 'Digital creator exploring generative prompt systems.',
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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Avatar & Bio */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xl sm:text-2xl font-semibold text-white shadow-sm">
              {creatorInitial}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-zinc-900 bg-emerald-500 text-[9px] text-white">
                ✓
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold text-white">
                  {creator.displayName}
                </h1>
                <span className="rounded-md border border-zinc-800 bg-zinc-950/70 px-2 py-0.5 text-xs font-medium text-zinc-400">
                  {creator.username}
                </span>
              </div>
              <p className="max-w-md text-xs sm:text-sm text-zinc-400 leading-relaxed">{creator.bio}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleFollowToggle}
              className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition active:scale-95 ${
                isFollowing
                  ? 'border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <Link
              to="/create"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-xs sm:text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>Create</span>
            </Link>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-8 grid grid-cols-2 gap-3 border-t border-zinc-800/80 pt-6 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5 text-center">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Artworks</span>
            <p className="mt-1 text-xl font-semibold text-white">{creator.totalCreations}</p>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5 text-center">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Remixes</span>
            <p className="mt-1 text-xl font-semibold text-zinc-300">{creator.totalRemixes}</p>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5 text-center">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Likes</span>
            <div className="mt-1 flex items-center justify-center gap-1 text-xl font-semibold text-rose-400">
              <HeartIcon className="h-4 w-4 fill-rose-500" filled />
              <span>{creator.totalLikes}</span>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5 text-center">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Saved</span>
            <div className="mt-1 flex items-center justify-center gap-1 text-xl font-semibold text-zinc-300">
              <BookmarkIcon className="h-4 w-4" filled />
              <span>{savedPosts.length}</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Tabs & Gallery */}
      <section className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('creations')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-medium transition ${
              activeTab === 'creations'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Creations</span>
            <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300">
              {creations.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('remixes')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-medium transition ${
              activeTab === 'remixes'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BranchIcon className="h-3.5 w-3.5" />
            <span>Remixes</span>
            <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300">
              {remixes.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-medium transition ${
              activeTab === 'saved'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookmarkIcon className="h-3.5 w-3.5" />
            <span>Saved Collection</span>
            <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300">
              {savedPosts.length}
            </span>
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <div className="col-span-full py-12">
              <EmptyState
                title={
                  activeTab === 'saved'
                    ? 'No saved pieces yet'
                    : activeTab === 'remixes'
                    ? 'No remixes yet'
                    : 'No creations yet'
                }
                description={
                  activeTab === 'saved'
                    ? 'Save artworks from the gallery to build your inspiration collection.'
                    : 'Create and publish artwork to populate this portfolio.'
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
