import { motion } from 'framer-motion';

const ImageCard = ({ post }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-900/80 shadow-[0_16px_50px_rgba(2,8,23,0.25)]"
    >
      <img src={post.photo} alt={post.prompt} className="h-56 w-full object-cover" />
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">{post.name}</h3>
          <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs text-slate-300">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="line-clamp-3 text-sm text-slate-400">{post.prompt}</p>
      </div>
    </motion.article>
  );
};

export default ImageCard;
