const EmptyState = ({ title, description }) => {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 px-6 py-12 text-center text-zinc-400">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">{description}</p>
    </div>
  );
};

export default EmptyState;
