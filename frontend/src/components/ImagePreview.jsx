import GenerationProgress from './GenerationProgress';
import { SparklesIcon, CheckIcon } from './Icons';

const ImagePreview = ({ image, loading, jobState }) => {
  if (loading) {
    return <GenerationProgress jobState={jobState} />;
  }

  if (!image) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center text-zinc-500">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400">
          <SparklesIcon className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-zinc-300">No artwork generated yet</p>
        <p className="mt-1 max-w-xs text-xs text-zinc-500">
          Enter a prompt and click "Generate Image" to render high-resolution visuals.
        </p>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm">
      <img
        src={image}
        alt="Generated preview"
        className="max-h-[500px] w-full object-contain"
      />
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md border border-zinc-700/80 bg-zinc-950/80 px-2.5 py-1 text-xs font-medium text-emerald-400 backdrop-blur-sm">
        <CheckIcon className="h-3.5 w-3.5" />
        <span>Ready</span>
      </div>
    </div>
  );
};

export default ImagePreview;
