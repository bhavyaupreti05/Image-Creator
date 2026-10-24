import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ImageCard = ({ post, onClick, onLike, isLiked, onBookmark, isSaved }) => {
  const [showHeart, setShowHeart] = useState(false);
  const navigate = useNavigate();

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setShowHeart(true);
    if (onLike) onLike(post._id);
    setTimeout(() => setShowHeart(false), 800);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (onLike) onLike(post._id);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (onBookmark) onBookmark(post);
  };

  const handleCreatorClick = (e) => {
    e.stopPropagation();
    const clean = post.name.replace(/^@/, '').trim();
    navigate(`/profile/${encodeURIComponent(clean)}`);
  };

  const creatorInitial = post.name?.trim()?.[0]?.toUpperCase() || 'A';
  const primaryTag = post.styleTags?.[0] || 'Digital Art';

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      whileHover={{ y: -5 }}
      onClick={() => onClick && onClick(post)}
      onDoubleClick={handleDoubleClick}
      className="group relative cursor-pointer overflow-hidden rounded-[1.8rem] border border-slate-800/80 bg-slate-900/80 shadow-[0_16px_50px_rgba(2,8,23,0.3)] transition-all hover:border-slate-700 hover:shadow-[0_20px_60px_rgba(6,182,212,0.12)]"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-950">
        <img
          src={post.photo}
          alt={post.prompt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Tag Pill */}
        <span className="absolute left-3.5 top-3.5 rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-0.5 text-[11px] font-medium text-cyan-300 backdrop-blur-md">
          #{primaryTag}
        </span>

        {/* Floating Heart Burst on Double Click */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1.3 }}
              exit={{ opacity: 0, scale: 1.6 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-6xl drop-shadow-2xl"
            >
              ❤️
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover Instagram-Style Gradient Shade */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          {/* Creator Pill with Profile Navigation */}
          <div
            onClick={handleCreatorClick}
            className="flex items-center gap-2 rounded-lg p-0.5 transition hover:opacity-80"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-[11px] font-bold text-white shadow-sm">
              {creatorInitial}
            </div>
            <span className="text-xs font-semibold text-slate-200 hover:text-cyan-300">
              {post.name}
            </span>
          </div>

          {/* Social Buttons: Like + Bookmark */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleLikeClick}
              className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 active:scale-95"
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              <span>{post.likes || 0}</span>
            </button>

            {onBookmark && (
              <button
                type="button"
                onClick={handleBookmarkClick}
                title={isSaved ? 'Saved in Moodboard' : 'Save to Moodboard'}
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs transition active:scale-95 ${
                  isSaved
                    ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                {isSaved ? '🔖' : '🏷️'}
              </button>
            )}
          </div>
        </div>

        {/* Prompt Preview */}
        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-400 group-hover:text-slate-300">
          {post.prompt}
        </p>
      </div>
    </motion.article>
  );
};

export default ImageCard;
