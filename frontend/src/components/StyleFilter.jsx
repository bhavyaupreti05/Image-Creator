const STYLES = [
  { id: 'All', label: 'All' },
  { id: 'Cinematic', label: 'Cinematic' },
  { id: 'Cyberpunk', label: 'Cyberpunk' },
  { id: 'Anime', label: 'Anime' },
  { id: '3D Render', label: '3D Render' },
  { id: 'Oil Painting', label: 'Oil Painting' },
  { id: 'Minimalist', label: 'Minimalist' },
  { id: 'Fantasy', label: 'Fantasy' },
  { id: 'Surrealism', label: 'Surrealism' },
];

const StyleFilter = ({ selected, onSelect }) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
      {STYLES.map((style) => {
        const isActive = selected === style.id;
        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onSelect(style.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition duration-150 ${
              isActive
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
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
