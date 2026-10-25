import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LineageTree from './LineageTree';
import StoryExportModal from './StoryExportModal';
import PromptMutationModal from './PromptMutationModal';
import {
  HeartIcon,
  BookmarkIcon,
  BranchIcon,
  CopyIcon,
  CloseIcon,
  ShareIcon,
  DownloadIcon,
  SparklesIcon,
} from './Icons';

const LightboxModal = ({ post, onClose, onLike, isLiked, onSelectPost, onBookmark, isSaved }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [showStoryExport, setShowStoryExport] = useState(false);
  const [mutationPair, setMutationPair] = useState(null);
  const [copied, setCopied] = useState(false);

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
      setCopied(true);
      toast.success('Prompt copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
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
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl lg:flex-row"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-900/90 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <CloseIcon className="h-4 w-4" />
          </button>

          {/* Left: Image Canvas */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-zinc-950 p-4 sm:p-6">
            <img
              src={post.photo}
              alt={post.prompt}
              className="max-h-[50vh] w-full rounded-xl object-contain lg:max-h-[78vh]"
            />
            <span className="absolute bottom-4 left-4 rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-[11px] font-medium text-zinc-400 backdrop-blur-sm">
              1024 × 1024
            </span>
          </div>

          {/* Right: Info & Lineage Panel */}
          <div className="flex w-full flex-col justify-between border-t border-zinc-800 p-5 sm:p-6 lg:w-[420px] lg:border-l lg:border-t-0 bg-zinc-900/70">
            <div className="space-y-5">
              {/* Creator Header */}
              <div
                onClick={() => {
                  onClose();
                  navigate(`/profile/${encodeURIComponent(post.name.replace(/^@/, '').trim())}`);
                }}
                className="flex cursor-pointer items-center gap-3 transition hover:opacity-80"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-sm font-semibold text-zinc-200">
                  {creatorInitial}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{post.name}</h4>
                  <p className="text-xs text-zinc-500">
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* View Switcher Tabs (Details vs Lineage) */}
              <div className="flex rounded-lg border border-zinc-800 bg-zinc-950/80 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                    activeTab === 'details'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('lineage')}
                  className={`flex items-center justify-center gap-1.5 flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                    activeTab === 'lineage'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <BranchIcon className="h-3.5 w-3.5" />
                  <span>Lineage Tree</span>
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
                          className="rounded-md border border-zinc-800 bg-zinc-950/60 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Lineage Callout if it's a remix */}
                  {post.parentId && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('lineage')}
                      className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 text-left text-xs text-zinc-300 transition hover:bg-zinc-800/60"
                    >
                      <div className="flex items-center gap-2">
                        <BranchIcon className="h-4 w-4 text-zinc-400" />
                        <span>Remix variation</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 underline">View Tree</span>
                    </button>
                  )}

                  {/* Prompt Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Prompt
                      </span>
                      <button
                        onClick={handleCopyPrompt}
                        className="flex items-center gap-1 text-xs text-zinc-400 transition hover:text-white"
                      >
                        <CopyIcon className="h-3.5 w-3.5" />
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="max-h-36 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 text-xs leading-relaxed text-zinc-300">
                      {post.prompt}
                    </div>
                  </div>

                  {/* Social Stats */}
                  <div className="flex items-center justify-between border-y border-zinc-800/80 py-3">
                    <button
                      type="button"
                      onClick={() => onLike(post._id)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition ${
                        isLiked ? 'text-rose-400' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <HeartIcon className="h-4 w-4" filled={isLiked} />
                      <span>{post.likes || 0} Likes</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {onBookmark && (
                        <button
                          type="button"
                          onClick={() => onBookmark(post)}
                          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition ${
                            isSaved
                              ? 'bg-zinc-800 text-white'
                              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          <BookmarkIcon className="h-3.5 w-3.5" filled={isSaved} />
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowStoryExport(true)}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                        title="Export 9:16 Story Card"
                      >
                        <ShareIcon className="h-3.5 w-3.5" />
                        <span>Story</span>
                      </button>

                      <a
                        href={post.photo}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                      >
                        <DownloadIcon className="h-3.5 w-3.5" />
                        <span>Raw</span>
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

            {/* Bottom Actions */}
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRemix}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 shadow-sm"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>Remix Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => setShowStoryExport(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                <ShareIcon className="h-3.5 w-3.5" />
                <span>Export Story Card</span>
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
