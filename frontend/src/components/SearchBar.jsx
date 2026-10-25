import { SearchIcon } from './Icons';

const SearchBar = ({ value, onChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="flex w-full items-center gap-2">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search prompts, styles, or creator handles..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-4 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
