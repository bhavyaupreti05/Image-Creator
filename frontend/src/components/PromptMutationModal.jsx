import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { computePromptDiff } from '../utils/diffUtils';
import { CloseIcon, CompareIcon } from './Icons';

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

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    updatePosition(clientX);
  };

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
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-7 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                  <CompareIcon className="h-3 w-3" />
                  <span>Version Comparison</span>
                </span>
                <span className="text-xs text-zinc-500">
                  Word-level prompt difference & visual split
                </span>
              </div>
              <h3 className="mt-1 text-lg font-semibold text-white">Prompt Mutation Analysis</h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
            {/* Visual Split-Screen Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-zinc-400">
                  Parent: @{parentPost.name.replace(/^@/, '')}
                </span>
                <span className="text-zinc-500 text-[11px]">Drag slider to inspect visual changes</span>
                <span className="text-zinc-200">
                  Variation: @{childPost.name.replace(/^@/, '')}
                </span>
              </div>

              <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                className="relative h-64 sm:h-80 w-full cursor-ew-resize select-none overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-inner"
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
                  className="pointer-events-none absolute bottom-0 top-0 w-px bg-white shadow-lg"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -ml-3.5 -mt-3.5 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-[10px] font-bold text-white shadow-lg">
                    ⟷
                  </div>
                </div>

                {/* Badges on corner */}
                <span className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                  Original
                </span>
                <span className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                  Remix
                </span>
              </div>
            </div>

            {/* Mutation Statistics Bar */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-center">
                <span className="text-[10px] uppercase font-medium tracking-wider text-zinc-500">Mutation Rate</span>
                <p className="text-base font-semibold text-white">{diffResult.mutationRate}%</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-center">
                <span className="text-[10px] uppercase font-medium tracking-wider text-zinc-500">Semantic Overlap</span>
                <p className="text-base font-semibold text-zinc-300">{diffResult.similarity}%</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-center">
                <span className="text-[10px] uppercase font-medium tracking-wider text-zinc-500">Added Tokens</span>
                <p className="text-base font-semibold text-emerald-400">+{diffResult.addedCount}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-center">
                <span className="text-[10px] uppercase font-medium tracking-wider text-zinc-500">Removed Tokens</span>
                <p className="text-base font-semibold text-rose-400">-{diffResult.removedCount}</p>
              </div>
            </div>

            {/* Git-Style Word Diff */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium uppercase tracking-wider text-zinc-400 text-[11px]">
                  Prompt Word Diff
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" /> Added
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" /> Removed
                  </span>
                </div>
              </div>

              <div className="max-h-36 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 font-mono text-xs leading-relaxed">
                {diffResult.tokens.map((token, index) => {
                  if (token.type === 'added') {
                    return (
                      <span
                        key={index}
                        className="mx-0.5 inline-block rounded bg-emerald-950/60 border border-emerald-800/60 px-1 py-0.5 font-medium text-emerald-300"
                      >
                        +{token.text}{' '}
                      </span>
                    );
                  }
                  if (token.type === 'removed') {
                    return (
                      <span
                        key={index}
                        className="mx-0.5 inline-block rounded bg-rose-950/40 border border-rose-900/40 px-1 py-0.5 text-rose-400 line-through opacity-75"
                      >
                        -{token.text}{' '}
                      </span>
                    );
                  }
                  return <span key={index} className="text-zinc-300">{token.text} </span>;
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
            <span className="text-xs text-zinc-500">
              Prompt DAG Node Comparison
            </span>
            <div className="flex items-center gap-2">
              {onSelectPost && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectPost(parentPost);
                  }}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                >
                  View Parent Artwork
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-white px-4 py-1.5 text-xs font-medium text-zinc-950 transition hover:bg-zinc-200"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PromptMutationModal;
