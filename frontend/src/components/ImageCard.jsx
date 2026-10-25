import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, BookmarkIcon } from './Icons';

const ImageCard = ({ post, onClick, onLike, isLiked, onBookmark, isSaved }) => {
  const [showHeart, setShowHeart] = useState(false);
  const navigate = useNavigate();

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setShowHeart(true);
    if (onLike) onLike(post._id);
    setTimeout(() => setShowHeart(false), 700);
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -3 }}
      onClick={() => onClick && onClick(post)}
      onDoubleClick={handleDoubleClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 shadow-sm transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-md"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
        <img
          src={post.photo}
          alt={post.prompt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-102"
        />

        {/* Tag Pill */}
        <span className="absolute left-3 top-3 rounded-md border border-zinc-700/60 bg-zinc-950/80 px-2 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-sm">
          {primaryTag}
        </span>

        {/* Double click heart animation */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-rose-500 drop-shadow-xl"
            >
              <HeartIcon className="h-16 w-16 fill-rose-500 stroke-rose-500" filled />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle Bottom Gradient Shade */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </div>

      {/* Card Body */}
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2">
          {/* Creator */}
          <div
            onClick={handleCreatorClick}
            className="flex items-center gap-2 rounded-md transition hover:opacity-80"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-semibold text-zinc-200">
              {creatorInitial}
            </div>
            <span className="text-xs font-medium text-zinc-300 hover:text-white truncate max-w-[110px]">
              {post.name}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition active:scale-95 ${
                isLiked
                  ? 'border-rose-900/60 bg-rose-950/40 text-rose-400'
                  : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <HeartIcon className="h-3 w-3" filled={isLiked} />
              <span className="text-[11px] font-medium">{post.likes || 0}</span>
            </button>

            {onBookmark && (
              <button
                type="button"
                onClick={handleBookmarkClick}
                title={isSaved ? 'Remove from Saved' : 'Save to Moodboard'}
                className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs transition active:scale-95 ${
                  isSaved
                    ? 'border-zinc-600 bg-zinc-800 text-white'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <BookmarkIcon className="h-3 w-3" filled={isSaved} />
              </button>
            )}
          </div>
        </div>

        {/* Prompt Preview */}
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
          {post.prompt}
        </p>
      </div>
    </motion.article>
  );
};

export default ImageCard;
