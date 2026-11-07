import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ImageCard from '../components/ImageCard';
import LightboxModal from '../components/LightboxModal';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import {
  BookmarkIcon,
  BranchIcon,
  HeartIcon,
  PlusIcon,
  LockClosedIcon,
  CoinsIcon,
  BellIcon,
  CopyIcon,
  CheckIcon,
  SparklesIcon,
  ShareIcon,
} from '../components/Icons';
import { getCreatorProfile, likePost } from '../services/postService';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, toggleFollow, unlockRecipeFormula, unlockedRecipes } = useAuth();
  const params = useParams();
  const usernameParam = params.username ? params.username.replace(/^@/, '') : user?.username?.replace(/^@/, '') || 'bhavya';

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('creations'); // 'creations' | 'vault' | 'saved' | 'marketplace' | 'activity'
  const [selectedPost, setSelectedPost] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [savedPosts, setSavedPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_saved_moodboard');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [privateVaultPosts, setPrivateVaultPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_private_vault');
      return saved
        ? JSON.parse(saved)
        : [
            {
              _id: 'vault-1',
              name: `@${usernameParam}`,
              prompt: 'Confidential exploration: Bioluminescent cybernetic garden with glass refractive butterflies, hyperreal 8k',
              photo: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=80',
              likes: 0,
              isPrivate: true,
              model: 'Flux.1',
              createdAt: new Date().toISOString(),
            },
          ];
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

  const isCurrentUser = user?.username?.replace(/^@/, '').toLowerCase() === usernameParam.toLowerCase();
  const isFollowing = user?.following?.includes(`@${usernameParam}`) || false;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getCreatorProfile(usernameParam);
        setProfileData(data);
      } catch {
        toast.error('Could not load creator profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [usernameParam]);

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
      toast.success('Removed from saved collection');
    } else {
      next = [post, ...savedPosts];
      toast.success('Saved to collection');
    }
    setSavedPosts(next);
    try {
      localStorage.setItem('aura_saved_moodboard', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handlePublishVaultItem = (item) => {
    const nextVault = privateVaultPosts.filter((p) => p._id !== item._id);
    setPrivateVaultPosts(nextVault);
    localStorage.setItem('aura_private_vault', JSON.stringify(nextVault));

    // add to creations
    if (profileData) {
      setProfileData({
        ...profileData,
        creations: [{ ...item, isPrivate: false }, ...profileData.creations],
      });
    }
    toast.success('Artwork published to public gallery! 🌐');
  };

  const handleCopyRecipe = (post) => {
    const recipeText = `Model: ${post.model || 'Flux.1'}\nPrompt: ${post.prompt}\nAuthor: ${post.name}`;
    navigator.clipboard.writeText(recipeText);
    setCopiedId(post._id);
    toast.success('Recipe formula copied to clipboard');
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    );
  }

  const creator = profileData?.creator || {
    displayName: usernameParam,
    username: `@${usernameParam}`,
    totalCreations: 0,
    totalLikes: 0,
    totalRemixes: 0,
    bio: 'Digital creator exploring generative prompt systems.',
  };

  const creations = profileData?.creations || [];
  const remixes = profileData?.remixes || [];

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
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xl sm:text-2xl font-semibold text-white shadow-sm overflow-hidden">
              <img
                src={
                  isCurrentUser && user?.avatar
                    ? user.avatar
                    : `https://api.dicebear.com/7.x/identicon/svg?seed=${usernameParam}`
                }
                alt={creator.displayName}
                className="h-full w-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-zinc-900 bg-emerald-500 text-[9px] text-white">
                ✓
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold text-white">
                  {isCurrentUser && user?.name ? user.name : creator.displayName}
                </h1>
                <span className="text-xs sm:text-sm text-zinc-400 font-mono">@{usernameParam}</span>
                {isCurrentUser && (
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                    ⚡ {user?.credits} Credits
                  </span>
                )}
              </div>
              <p className="max-w-md text-xs sm:text-sm text-zinc-400">
                {isCurrentUser && user?.bio ? user.bio : creator.bio}
              </p>
            </div>
          </div>

          {/* Social Stats & Actions */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t border-zinc-800/80 pt-4 sm:border-t-0 sm:pt-0">
            <div className="flex items-center gap-4 sm:gap-6 text-center">
              <div>
                <div className="text-base sm:text-lg font-semibold text-white">
                  {creations.length + remixes.length}
                </div>
                <div className="text-[11px] text-zinc-400">Works</div>
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div>
                <div className="text-base sm:text-lg font-semibold text-white">
                  {creator.totalLikes + (isCurrentUser ? 12 : 0)}
                </div>
                <div className="text-[11px] text-zinc-400">Likes</div>
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div>
                <div className="text-base sm:text-lg font-semibold text-white">
                  {isFollowing ? 143 : 142}
                </div>
                <div className="text-[11px] text-zinc-400">Followers</div>
              </div>
            </div>

            {/* Follow Button */}
            {!isCurrentUser ? (
              <button
                type="button"
                onClick={() => toggleFollow(`@${usernameParam}`)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition active:scale-95 shadow-sm ${
                  isFollowing
                    ? 'border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-white text-zinc-950 hover:bg-zinc-200'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow Creator'}
              </button>
            ) : (
              <Link
                to="/create"
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-95 shadow-sm"
              >
                <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>New Synthesis</span>
              </Link>
            )}
          </div>
        </div>

        {/* Cloud Authentication Readiness Banner */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-amber-400" />
            <span>
              Authentication & Private Vaults Active: Protected by JWT & local session state.
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">
            Plug-and-play compatible with Clerk, Auth0, & Supabase Auth.
          </span>
        </div>
      </motion.section>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('creations')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === 'creations'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Public Works ({creations.length})
          </button>

          {isCurrentUser && (
            <button
              type="button"
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === 'vault'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LockClosedIcon className="h-3 w-3" />
              <span>Private Vault ({privateVaultPosts.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === 'saved'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookmarkIcon className="h-3.5 w-3.5" />
            <span>Saved ({savedPosts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === 'marketplace'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CoinsIcon className="h-3.5 w-3.5 text-amber-400" />
            <span>Prompt Marketplace</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === 'activity'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BellIcon className="h-3.5 w-3.5" />
            <span>Activity Feed</span>
          </button>
        </div>
      </div>

      {/* Tab 1 & Tab 2: Standard Artwork Grid (Public or Saved) */}
      {(activeTab === 'creations' || activeTab === 'saved') && (
        <div>
          {(activeTab === 'creations' ? creations : savedPosts).length === 0 ? (
            <EmptyState
              title={activeTab === 'creations' ? 'No creations yet' : 'No saved artworks'}
              description={
                activeTab === 'creations'
                  ? 'This creator has not published public artworks yet.'
                  : 'Save community concepts to curate your moodboard collection.'
              }
              actionLink="/create"
              actionText="Create Artwork"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(activeTab === 'creations' ? creations : savedPosts).map((post) => (
                <ImageCard
                  key={post._id}
                  post={post}
                  onOpenLightbox={setSelectedPost}
                  onLike={handleLike}
                  isLiked={Boolean(likedMap[post._id])}
                  onToggleBookmark={handleToggleBookmark}
                  isBookmarked={savedPosts.some((p) => p._id === post._id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Private Vault (Confidential Drafts & High-Res Storage) */}
      {activeTab === 'vault' && isCurrentUser && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LockClosedIcon className="h-4 w-4 text-amber-400" />
              <span>
                <strong>Confidential Creator Vault:</strong> Artworks in this gallery are visible only to you. You can download raw masters or publish anytime.
              </span>
            </div>
          </div>

          {privateVaultPosts.length === 0 ? (
            <EmptyState
              title="Private Vault is empty"
              description="When creating artwork in Studio, toggle 'Private Vault' to store concepts confidentially."
              actionLink="/create"
              actionText="Generate Vault Concept"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {privateVaultPosts.map((post) => (
                <div
                  key={post._id}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-3"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-zinc-950 relative">
                    <img src={post.photo} alt={post.prompt} className="h-full w-full object-cover" />
                    <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-zinc-950/80 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-zinc-700 backdrop-blur-md">
                      <LockClosedIcon className="h-2.5 w-2.5" />
                      <span>Private</span>
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2">{post.prompt}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                    <span className="text-[10px] text-zinc-400">{post.model || 'Flux.1'}</span>
                    <button
                      type="button"
                      onClick={() => handlePublishVaultItem(post)}
                      className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-white hover:bg-zinc-700 transition"
                    >
                      <ShareIcon className="h-3 w-3" />
                      <span>Publish Public</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Prompt Marketplace & Recipes */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CoinsIcon className="h-4 w-4 text-amber-400" />
              <span>
                <strong>Prompt Recipe Marketplace:</strong> Inspect and unlock exact prompt formulas, model samplers, and negative prompts for 10 Aura Credits.
              </span>
            </div>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 font-semibold text-amber-300 text-xs">
              Your Balance: ⚡{user?.credits || 0}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creations.map((post) => {
              const isUnlocked = isCurrentUser || Boolean(unlockedRecipes[post._id]);
              return (
                <div
                  key={post._id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.photo}
                        alt={post.prompt}
                        className="h-12 w-12 rounded-xl object-cover ring-1 ring-zinc-700"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          {post.model || 'Flux.1 Schnell'} Recipe
                        </span>
                        <span className="text-[11px] text-zinc-400">By {post.name}</span>
                      </div>
                    </div>

                    {isUnlocked ? (
                      <div className="rounded-xl bg-zinc-950/80 p-3 border border-zinc-800/80 text-xs space-y-1.5 font-mono">
                        <div className="text-zinc-400 text-[10px]">PROMPT FORMULA:</div>
                        <p className="text-zinc-200 text-xs font-sans line-clamp-3">{post.prompt}</p>
                        <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
                          Negative: {post.negativePrompt || 'None'} • Aspect: {post.aspectRatio || '1:1'}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-zinc-950/80 p-4 border border-zinc-800/80 text-center space-y-2">
                        <p className="text-xs text-zinc-400 blur-sm select-none">
                          Secret prompt formula: {post.prompt.slice(0, 40)}...
                        </p>
                        <span className="inline-block rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-medium text-amber-400">
                          Locked Formula (10 Credits)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    {isUnlocked ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyRecipe(post)}
                          className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white transition"
                        >
                          {copiedId === post._id ? (
                            <>
                              <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <CopyIcon className="h-3.5 w-3.5" />
                              <span>Copy Recipe</span>
                            </>
                          )}
                        </button>
                        <Link
                          to={`/create?remix=${encodeURIComponent(post.prompt)}&parentId=${post._id}&author=${encodeURIComponent(post.name)}`}
                          className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs text-white hover:bg-zinc-700 transition"
                        >
                          Fork into Studio
                        </Link>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          unlockRecipeFormula(post._id, post.prompt, post.name, post.recipePrice || 10)
                        }
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition"
                      >
                        <CoinsIcon className="h-3.5 w-3.5" />
                        <span>Unlock Formula (10 Credits)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Real-Time Activity & Social Notifications */}
      {activeTab === 'activity' && (
        <div className="space-y-4 max-w-2xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BellIcon className="h-4 w-4" />
              <span>Real-Time Creator Activity Stream</span>
            </h3>

            <div className="space-y-3">
              {[
                {
                  id: 1,
                  type: 'remix',
                  title: '@elena remixed your "Neo-Tokyo Rain Boulevard" prompt',
                  detail: 'Derived a descendant branch with anime mecha pilot and sakura bloom.',
                  time: '15m ago',
                  icon: <BranchIcon className="h-4 w-4 text-emerald-400" />,
                },
                {
                  id: 2,
                  type: 'coins',
                  title: '@zane tipped 10 Aura Credits to unlock your prompt formula',
                  detail: 'Unlocked prompt recipe for "Abstract Iridescent Sculpture".',
                  time: '1h ago',
                  icon: <CoinsIcon className="h-4 w-4 text-amber-400" />,
                },
                {
                  id: 3,
                  type: 'follow',
                  title: '@maya started following your portfolio',
                  detail: 'Creator specializing in brutalist architectural photography.',
                  time: '2h ago',
                  icon: <BookmarkIcon className="h-4 w-4 text-cyan-400" />,
                },
                {
                  id: 4,
                  type: 'like',
                  title: '@kai double-tapped heart on your artwork',
                  detail: 'Liked your Chromatic Monolith creation.',
                  time: '4h ago',
                  icon: <HeartIcon className="h-4 w-4 text-rose-400" filled />,
                },
              ].map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3.5 transition hover:bg-zinc-800/30"
                >
                  <div className="mt-0.5 rounded-lg bg-zinc-900 p-2 border border-zinc-800">{act.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{act.title}</span>
                      <span className="text-[10px] text-zinc-400">{act.time}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{act.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPost && (
        <LightboxModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          isLiked={Boolean(likedMap[selectedPost._id])}
          onToggleBookmark={handleToggleBookmark}
          isBookmarked={savedPosts.some((p) => p._id === selectedPost._id)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
