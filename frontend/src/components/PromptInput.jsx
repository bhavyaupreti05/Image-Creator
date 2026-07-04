const PromptInput = ({ value, onChange, onRandomize }) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-200">Prompt</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        placeholder="Describe the image you want to create"
      />
      <button
        type="button"
        onClick={onRandomize}
        className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
      >
        Random Prompt
      </button>
    </div>
  );
};

export default PromptInput;
