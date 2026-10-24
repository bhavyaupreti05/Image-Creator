import GenerationProgress from './GenerationProgress';

const ImagePreview = ({ image, loading, jobState }) => {
  if (loading) {
    return <GenerationProgress jobState={jobState} />;
  }

  if (!image) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-800 bg-slate-950/60 p-8 text-center text-slate-500">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 text-2xl text-slate-400">
          🖼️
        </div>
        <p className="text-sm font-medium text-slate-300">Your live canvas is blank</p>
        <p className="mt-1 max-w-xs text-xs text-slate-500">
          Enter a prompt and click "Synthesize Visual" to launch an asynchronous GPU generation job.
        </p>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-2xl">
      <img
        src={image}
        alt="Synthesized preview"
        className="max-h-[500px] w-full object-contain"
      />
      <div className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md">
        ✓ Synthesized & Optimized
      </div>
    </div>
  );
};

export default ImagePreview;
