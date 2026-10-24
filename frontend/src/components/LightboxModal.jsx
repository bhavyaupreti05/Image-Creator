import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LineageTree from './LineageTree';
import StoryExportModal from './StoryExportModal';
import PromptMutationModal from './PromptMutationModal';

const LightboxModal = ({ post, onClose, onLike, isLiked, onSelectPost, onBookmark, isSaved }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [showStoryExport, setShowStoryExport] = useState(false);
  const [mutationPair, setMutationPair] = useState(null);

  useEffect(() => {
    setActiveTab('details');
  }, [post?._id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!post) return null;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(post.prompt);
      toast.success('Prompt copied to clipboard!');
    } catch {
      toast.error('Could not copy prompt');
    }
  };

  const handleRemix = () => {
    onClose();
    navigate(
      `/create?remix=${encodeURIComponent(post.prompt)}&parentId=${post._id}&author=${encodeURIComponent(
        post.name,
      )}`,
    );
  };

  const creatorInitial = post.name?.trim()?.[0]?.toUpperCase() || 'A';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/95 shadow-[0_25px_80px_rgba(0,0,0,0.7)] lg:flex-row"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 backdrop-blur transition hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>

          {/* Left: Image Canvas */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/60 p-4 sm:p-6">
            <img
              src={post.photo}
              alt={post.prompt}
              className="max-h-[50vh] w-full rounded-2xl object-contain shadow-2xl lg:max-h-[80vh]"
            />
            <span className="absolute bottom-6 left-6 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur">
              1024 × 1024 High-Res
            </span>
          </div>

          {/* Right: Info & Lineage Panel */}
          <div className="flex w-full flex-col justify-between border-t border-slate-800 p-6 lg:w-[400px] lg:border-l lg:border-t-0">
            <div className="space-y-5">
              {/* Creator Header */}
              <div
                onClick={() => {
                  onClose();
                  navigate(`/profile/${encodeURIComponent(post.name.replace(/^@/, '').trim())}`);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-xl transition hover:opacity-85"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-sm font-bold text-white shadow-md">
                  {creatorInitial}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white hover:text-cyan-300">{post.name}</h4>
                  <p className="text-xs text-slate-400">
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* View Switcher Tabs (Details vs 🧬 Lineage Tree) */}
              <div className="flex rounded-xl border border-slate-800 bg-slate-950/80 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                    activeTab === 'details'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('lineage')}
                  className={`flex items-center justify-center gap-1.5 flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                    activeTab === 'lineage'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-sm'
                      : 'text-cyan-400 hover:text-cyan-300'
                  }`}
                >
                  <span>🧬 Prompt Lineage</span>
                </button>
              </div>

              {/* Tab 1: Details */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {/* Style Tags */}
                  {post.styleTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.styleTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-0.5 text-[11px] font-medium text-cyan-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Lineage Callout if it's a remix */}
                  {post.parentId && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('lineage')}
                      className="flex w-full items-center justify-between rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-left text-xs text-purple-200 transition hover:bg-purple-500/20"
                    >
                      <div className="flex items-center gap-2">
                        <span>🧬</span>
                        <span>Remix branch</span>
                      </div>
                      <span className="text-[10px] text-purple-300 underline">View Tree ➔</span>
                    </button>
                  )}

                  {/* Prompt Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Prompt
                      </span>
                      <button
                        onClick={handleCopyPrompt}
                        className="flex items-center gap-1 text-xs text-cyan-400 transition hover:text-cyan-300"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="max-h-36 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs leading-relaxed text-slate-200">
                      {post.prompt}
                    </div>
                  </div>

                  {/* Social Stats */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-y border-slate-800/80 py-3">
                    <button
                      type="button"
                      onClick={() => onLike(post._id)}
                      className="flex items-center gap-2 text-sm font-medium text-slate-200 transition hover:text-rose-400"
                    >
                      <span
                        className={`text-xl transition-transform active:scale-125 ${
                          isLiked ? 'text-rose-500' : 'text-slate-400'
                        }`}
                      >
                        {isLiked ? '❤️' : '🤍'}
                      </span>
                      <span>{post.likes || 0} Likes</span>
                    </button>

                    <div className="flex items-center gap-3">
                      {onBookmark && (
                        <button
                          type="button"
                          onClick={() => onBookmark(post)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 transition hover:text-cyan-300"
                        >
                          <span>{isSaved ? '🔖' : '🏷️'}</span>
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowStoryExport(true)}
                        className="flex items-center gap-1 text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
                        title="Export 9:16 Story Card for Instagram"
                      >
                        <span>📱</span>
                        <span>Story</span>
                      </button>

                      <a
                        href={post.photo}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="text-xs text-slate-400 transition hover:text-white"
                      >
                        Full ↗
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Visual Lineage Tree */}
              {activeTab === 'lineage' && (
                <div className="max-h-[50vh] overflow-y-auto pr-1">
                  <LineageTree
                    postId={post._id}
                    onSelectPost={onSelectPost}
                    onRemixClick={handleRemix}
                    onCompareMutation={(parent, child) => setMutationPair({ parent, child })}
                  />
                </div>
              )}
            </div>

            {/* Bottom Actions: Remix & Export Story */}
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRemix}
                className="w-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 p-[1px] shadow-lg shadow-indigo-500/20 transition hover:shadow-indigo-500/35"
              >
                <div className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-transparent">
                  <span>✨ Remix This Prompt</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowStoryExport(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white"
              >
                <span>📱 Export 9:16 Instagram Story Card</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Story Export Modal */}
        {showStoryExport && (
          <StoryExportModal
            post={post}
            onClose={() => setShowStoryExport(false)}
          />
        )}

        {/* Prompt Mutation Comparison Modal */}
        {mutationPair && (
          <PromptMutationModal
            parentPost={mutationPair.parent}
            childPost={mutationPair.child}
            onClose={() => setMutationPair(null)}
            onSelectPost={(selected) => {
              setMutationPair(null);
              if (onSelectPost) onSelectPost(selected);
            }}
          />
        )}
      </div>
    </AnimatePresence>
  );
};

export default LightboxModal;
