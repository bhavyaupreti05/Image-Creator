
const STYLES = [
  { id: 'All', label: 'All Aesthetics' },
  { id: 'Cyberpunk', label: '⚡ Cyberpunk' },
  { id: 'Anime', label: '✨ Anime / Manga' },
  { id: 'Oil Painting', label: '🎨 Oil Painting' },
  { id: '3D Render', label: '💎 3D Render' },
  { id: 'Fantasy', label: '🐉 Dark Fantasy' },
  { id: 'Surrealism', label: '🌀 Surrealism' },
  { id: 'Cinematic', label: '🎬 Cinematic' },
  { id: 'Minimalist', label: '⚪ Minimalist' },
];

const StyleFilter = ({ selected, onSelect }) => {
  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-2">
      {STYLES.map((style) => {
        const isActive = selected === style.id;
        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onSelect(style.id)}
            className={`relative whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20'
                : 'border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            {style.label}
          </button>
        );
      })}
    </div>
  );
};

export default StyleFilter;
