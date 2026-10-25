import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPostLineage } from '../services/postService';
import { BranchIcon, CompareIcon } from './Icons';

const LineageTree = ({ postId, onSelectPost, onRemixClick, onCompareMutation }) => {
  const [lineage, setLineage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLineage = async () => {
      setLoading(true);
      try {
        const data = await getPostLineage(postId);
        if (isMounted) setLineage(data);
      } catch (err) {
        console.error('Failed to load lineage', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (postId) {
      fetchLineage();
    }

    return () => {
      isMounted = false;
    };
  }, [postId]);

  if (loading) {
    return (
      <div className="flex h-56 flex-col items-center justify-center space-y-2.5">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
        <p className="text-xs text-zinc-500">Loading version history...</p>
      </div>
    );
  }

  if (!lineage) {
    return (
      <div className="py-8 text-center text-xs text-zinc-500">
        Could not retrieve lineage data for this artwork.
      </div>
    );
  }

  const { post, ancestors, remixes, generationDepth, totalDescendants } = lineage;

  return (
    <div className="space-y-5">
      {/* Lineage Telemetry Header */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Generation</span>
          <p className="text-sm font-semibold text-white">Gen #{generationDepth}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Variations</span>
          <p className="text-sm font-semibold text-zinc-300">{totalDescendants} Remixes</p>
        </div>
      </div>

      {/* Ancestor Evolution Chain */}
      <div className="space-y-2.5">
        <h5 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Ancestry Chain
        </h5>

        <div className="space-y-2">
          {ancestors.map((ancestor, index) => (
            <motion.div
              key={ancestor._id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => onSelectPost(ancestor)}
              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-2.5 transition hover:border-zinc-700 hover:bg-zinc-850"
            >
              <img
                src={ancestor.photo}
                alt={ancestor.prompt}
                className="h-11 w-11 rounded-lg object-cover"
              />
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                    Gen #{index + 1}: {ancestor.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300">View</span>
                </div>
                <p className="line-clamp-1 text-[11px] text-zinc-400">{ancestor.prompt}</p>
              </div>
            </motion.div>
          ))}

          {/* Current Node */}
          <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/50 p-2.5">
            <img
              src={post.photo}
              alt={post.prompt}
              className="h-11 w-11 rounded-lg object-cover"
            />
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Gen #{generationDepth} (Current Piece)
                </span>
                <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-[9px] font-medium text-zinc-200">
                  Active
                </span>
              </div>
              <p className="line-clamp-1 text-[11px] text-zinc-300">{post.prompt}</p>
            </div>
          </div>

          {/* Prompt Mutation Compare Button */}
          {ancestors.length > 0 && onCompareMutation && (
            <button
              type="button"
              onClick={() => onCompareMutation(ancestors[ancestors.length - 1], post)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 hover:text-white active:scale-95 shadow-sm"
            >
              <CompareIcon className="h-3.5 w-3.5" />
              <span>Compare Prompt Diff with Parent</span>
            </button>
          )}
        </div>
      </div>

      {/* Direct Children / Branches */}
      <div className="space-y-2.5 pt-1">
        <h5 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Remixes From This Piece ({remixes.length})
        </h5>

        {remixes.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {remixes.map((child) => (
              <div
                key={child._id}
                onClick={() => onSelectPost(child)}
                className="group cursor-pointer overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60 p-2 transition hover:border-zinc-700 hover:bg-zinc-900"
              >
                <img
                  src={child.photo}
                  alt={child.prompt}
                  className="h-20 w-full rounded-lg object-cover"
                />
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <p className="truncate text-[11px] font-medium text-zinc-300 group-hover:text-white">
                    by {child.name}
                  </p>
                  {onCompareMutation && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompareMutation(post, child);
                      }}
                      className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      title="Compare diff"
                    >
                      Diff
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/40 p-4 text-center">
            <p className="text-xs text-zinc-400">No remix branches yet</p>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Be the first to branch this prompt into a new variation.
            </p>
            {onRemixClick && (
              <button
                type="button"
                onClick={onRemixClick}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                <BranchIcon className="h-3 w-3" />
                <span>Create First Remix</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LineageTree;
