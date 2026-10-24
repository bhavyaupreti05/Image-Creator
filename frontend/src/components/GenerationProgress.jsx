import { motion } from 'framer-motion';

const STAGES = [
  { id: 'queued', label: 'Queued in Queue', min: 10 },
  { id: 'synthesizing', label: 'Diffusion Latents', min: 40 },
  { id: 'optimizing', label: 'Cloudinary CDN', min: 75 },
];

const GenerationProgress = ({ jobState }) => {
  const progress = jobState?.progress ?? 15;
  const stageMessage = jobState?.stage || 'Preparing generative worker...';

  return (
    <div className="relative flex min-h-[380px] w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-slate-950/90 p-8 shadow-[0_0_60px_rgba(6,182,212,0.1)]">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* SSE Telemetry Header Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-[11px] font-semibold text-cyan-200">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
        <span>SSE Stream Telemetry Active</span>
      </div>

      {/* Large Glowing Progress Counter */}
      <motion.div
        key={progress}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="mb-4 text-6xl font-black tracking-tight text-white sm:text-7xl"
      >
        <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
          {progress}%
        </span>
      </motion.div>

      {/* Current Real-Time Pipeline Message */}
      <p className="mb-8 max-w-sm text-center text-xs font-medium text-slate-300">
        {stageMessage}
      </p>

      {/* Progress Track */}
      <div className="relative mb-8 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
        />
      </div>

      {/* Pipeline Stage Pills */}
      <div className="grid w-full max-w-md grid-cols-3 gap-2">
        {STAGES.map((s, idx) => {
          const isPassed = progress >= s.min;
          return (
            <div
              key={s.id}
              className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                isPassed
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200 shadow-sm'
                  : 'border-slate-800 bg-slate-900/40 text-slate-500'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Step 0{idx + 1}
              </span>
              <span className="mt-0.5 truncate text-[11px] font-semibold">
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
