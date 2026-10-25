import { motion } from 'framer-motion';

const STAGES = [
  { id: 'queued', label: 'Queued', min: 10 },
  { id: 'synthesizing', label: 'Generating', min: 40 },
  { id: 'optimizing', label: 'Optimizing', min: 75 },
];

const GenerationProgress = ({ jobState }) => {
  const progress = jobState?.progress ?? 15;
  const stageMessage = jobState?.stage || 'Processing image generation job...';

  return (
    <div className="relative flex min-h-[380px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/70 p-6 sm:p-8">
      {/* Live Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs font-medium text-zinc-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Live Processing Stream</span>
      </div>

      {/* Counter */}
      <motion.div
        key={progress}
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        className="mb-2 text-5xl font-semibold tracking-tight text-white"
      >
        {progress}%
      </motion.div>

      {/* Stage Message */}
      <p className="mb-6 max-w-sm text-center text-xs text-zinc-400">
        {stageMessage}
      </p>

      {/* Progress Track */}
      <div className="relative mb-6 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full rounded-full bg-white"
        />
      </div>

      {/* Stage Steps */}
      <div className="grid w-full max-w-sm grid-cols-3 gap-2">
        {STAGES.map((s, idx) => {
          const isPassed = progress >= s.min;
          return (
            <div
              key={s.id}
              className={`flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-center transition ${
                isPassed
                  ? 'border-zinc-700 bg-zinc-900/80 text-white'
                  : 'border-zinc-800/80 bg-zinc-950/40 text-zinc-600'
              }`}
            >
              <span className="text-[10px] uppercase font-medium tracking-wider">
                Step {idx + 1}
              </span>
              <span className="mt-0.5 truncate text-[11px] font-medium">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GenerationProgress;
