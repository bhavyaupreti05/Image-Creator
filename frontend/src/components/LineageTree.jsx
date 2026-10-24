import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPostLineage } from '../services/postService';

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
      <div className="flex h-64 flex-col items-center justify-center space-y-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <p className="text-xs text-slate-400">Tracing prompt evolution tree...</p>
      </div>
    );
  }

  if (!lineage) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        Could not retrieve lineage data for this artwork.
      </div>
    );
  }

  const { post, ancestors, remixes, generationDepth, totalDescendants } = lineage;

  return (
    <div className="space-y-6">
      {/* Lineage Telemetry Header */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Generation</span>
          <p className="text-sm font-bold text-white">Gen #{generationDepth}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Offspring Variations</span>
          <p className="text-sm font-bold text-cyan-300">{totalDescendants} Remixes</p>
        </div>
      </div>

      {/* Ancestor Evolution Chain */}
      <div className="space-y-3">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Lineage Chain (Origin to Current)
        </h5>

        <div className="space-y-2.5">
          {ancestors.map((ancestor, index) => (
            <motion.div
              key={ancestor._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => onSelectPost(ancestor)}
              className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-2.5 transition hover:border-cyan-500/50 hover:bg-slate-900"
            >
              <img
                src={ancestor.photo}
                alt={ancestor.prompt}
                className="h-12 w-12 rounded-xl object-cover shadow"
              />
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                    Gen #{index + 1}: {ancestor.name}
                  </span>
                  <span className="text-[10px] text-slate-500">View ↗</span>
                </div>
                <p className="line-clamp-1 text-[11px] text-slate-400">{ancestor.prompt}</p>
              </div>
            </motion.div>
          ))}

          {/* Current Node */}
          <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/50 bg-cyan-500/10 p-2.5 ring-1 ring-cyan-500/30">
            <img
              src={post.photo}
              alt={post.prompt}
              className="h-12 w-12 rounded-xl object-cover shadow"
            />
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-200">
                  Gen #{generationDepth} (Current Artwork)
                </span>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold uppercase text-cyan-300">
                  Viewing
                </span>
              </div>
              <p className="line-clamp-1 text-[11px] text-slate-300">{post.prompt}</p>
            </div>
          </div>

          {/* Prompt Mutation Compare Button */}
          {ancestors.length > 0 && onCompareMutation && (
            <button
              type="button"
              onClick={() => onCompareMutation(ancestors[ancestors.length - 1], post)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 py-2.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/25 active:scale-95 shadow-md shadow-cyan-500/10"
            >
              <span>⚡ Compare Prompt Mutation with Parent</span>
            </button>
          )}
        </div>
      </div>

      {/* Direct Children / Branches */}
      <div className="space-y-3 pt-2">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Remixes Spawned From This Piece ({remixes.length})
        </h5>

        {remixes.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {remixes.map((child) => (
              <div
                key={child._id}
                onClick={() => onSelectPost(child)}
                className="group cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 p-2 transition hover:border-purple-500/50 hover:bg-slate-900"
              >
                <img
                  src={child.photo}
                  alt={child.prompt}
                  className="h-20 w-full rounded-lg object-cover"
                />
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <p className="truncate text-[11px] font-semibold text-slate-200 group-hover:text-purple-300">
                    by {child.name}
                  </p>
                  {onCompareMutation && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompareMutation(post, child);
                      }}
                      className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 hover:bg-cyan-500 hover:text-white"
                      title="Compare Prompt Diff"
                    >
                      Diff
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-800 p-4 text-center">
            <p className="text-xs text-slate-400">No community remixes yet.</p>
            <button
              type="button"
              onClick={onRemixClick}
              className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              ✨ Be the first to remix this branch
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineageTree;
