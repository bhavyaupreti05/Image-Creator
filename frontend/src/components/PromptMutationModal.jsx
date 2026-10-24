import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { computePromptDiff } from '../utils/diffUtils';

const PromptMutationModal = ({ parentPost, childPost, onClose, onSelectPost }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const diffResult = useMemo(() => {
    return computePromptDiff(parentPost?.prompt || '', childPost?.prompt || '');
  }, [parentPost?.prompt, childPost?.prompt]);

  const updatePosition = useCallback((clientX) => {
    const container = containerRef.current;
    if (!container || clientX === undefined) return;
    const rect = container.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      updatePosition(clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, updatePosition]);

  if (!parentPost || !childPost) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                  🧬 Mutation Engine
                </span>
                <span className="text-xs text-slate-400">
                  LCS Diff & Visual Comparison
                </span>
              </div>
              <h3 className="mt-1 text-xl font-bold text-white">Prompt Mutation Analyzer</h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
            {/* Visual Split-Screen Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-indigo-400">
                  ◀ Parent Concept (@{parentPost.name.replace(/^@/, '')})
                </span>
                <span className="text-xs text-slate-500">Drag divider to compare</span>
                <span className="text-cyan-400">
                  Remix Mutation (@{childPost.name.replace(/^@/, '')}) ▶
                </span>
              </div>

              <div
                ref={containerRef}
                onPointerDown={(e) => {
                  setIsDragging(true);
                  handlePointerMove(e);
                }}
                className="relative h-64 sm:h-96 w-full cursor-ew-resize select-none overflow-hidden rounded-2xl border border-slate-700/80 bg-black shadow-2xl"
              >
                {/* Child Image (Base / Right) */}
                <img
                  src={childPost.photo}
                  alt={childPost.prompt}
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                />

                {/* Parent Image (Clipped Left Layer) */}
                <div
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={parentPost.photo}
                    alt={parentPost.prompt}
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{
                      width: containerRef.current?.clientWidth || '100%',
                      maxWidth: 'none',
                    }}
                  />
                </div>

                {/* Draggable Divider Line & Knob */}
                <div
                  className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-gradient-to-b from-cyan-400 via-white to-indigo-500 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -ml-4 -mt-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-900/90 text-xs font-bold text-white shadow-xl backdrop-blur">
                    ⟷
                  </div>
                </div>

                {/* Badges on corner */}
                <span className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-slate-950/80 px-2 py-1 text-[11px] font-medium text-indigo-300 backdrop-blur">
                  Root Concept
                </span>
                <span className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-slate-950/80 px-2 py-1 text-[11px] font-medium text-cyan-300 backdrop-blur">
                  Fork Mutation
                </span>
              </div>
            </div>

            {/* Mutation Statistics Bar */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Mutation Rate</span>
                <p className="text-lg font-extrabold text-cyan-400">{diffResult.mutationRate}%</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">DNA Similarity</span>
                <p className="text-lg font-extrabold text-purple-400">{diffResult.similarity}%</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400">Added Tokens</span>
                <p className="text-lg font-extrabold text-emerald-400">+{diffResult.addedCount}</p>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-center">
                <span className="text-[10px] uppercase tracking-wider text-rose-400">Removed Tokens</span>
                <p className="text-lg font-extrabold text-rose-400">-{diffResult.removedCount}</p>
              </div>
            </div>

            {/* Git-Style Word Diff */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-400">
                  Semantic Prompt Diff (Git Style)
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> +Added
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="inline-block h-2 w-2 rounded-full bg-rose-400" /> -Removed
                  </span>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-xs leading-relaxed">
                {diffResult.tokens.map((token, index) => {
                  if (token.type === 'added') {
                    return (
                      <span
                        key={index}
                        className="mx-0.5 inline-block rounded bg-emerald-500/20 px-1 py-0.5 font-bold text-emerald-300 shadow-sm"
                      >
                        +{token.text}{' '}
                      </span>
                    );
                  }
                  if (token.type === 'removed') {
                    return (
                      <span
                        key={index}
                        className="mx-0.5 inline-block rounded bg-rose-500/20 px-1 py-0.5 text-rose-300 line-through opacity-75"
                      >
                        -{token.text}{' '}
                      </span>
                    );
                  }
                  return <span key={index} className="text-slate-300">{token.text} </span>;
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
            <span className="text-xs text-slate-400">
              Comparing 2 Prompt Nodes in Evolutionary DAG
            </span>
            <div className="flex items-center gap-2">
              {onSelectPost && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectPost(parentPost);
                  }}
                  className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-indigo-300 hover:bg-slate-800"
                >
                  Inspect Parent ➔
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PromptMutationModal;
