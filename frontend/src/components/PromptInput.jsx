import { ShuffleIcon } from './Icons';

const PromptInput = ({ value, onChange, onRandomize }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Prompt
        </label>
        <button
          type="button"
          onClick={onRandomize}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
        >
          <ShuffleIcon className="h-3 w-3" />
          <span>Surprise me</span>
        </button>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 leading-relaxed"
        placeholder="Describe the scene, subject, lighting, and medium..."
      />
    </div>
  );
};

export default PromptInput;
