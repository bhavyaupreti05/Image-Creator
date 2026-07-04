const EmptyState = ({ title, description }) => {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/70 px-8 py-12 text-center text-slate-400">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm">{description}</p>
    </div>
  );
};

export default EmptyState;
