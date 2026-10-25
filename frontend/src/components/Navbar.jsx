import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProvenanceScannerModal from './ProvenanceScannerModal';
import { ShieldCheckIcon, BookmarkIcon, PlusIcon } from './Icons';

const Navbar = () => {
  const [showScanner, setShowScanner] = useState(false);
  const location = useLocation();

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-950 font-semibold text-xs transition group-hover:bg-white shadow-sm">
            ✦
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold tracking-tight text-white">Aura</span>
            <span className="hidden text-[11px] font-medium uppercase tracking-wider text-zinc-400 sm:inline">
              Studio
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/"
            className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
              isCurrent('/')
                ? 'bg-zinc-800/90 text-white'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            Explore
          </Link>

          <Link
            to="/profile"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
              location.pathname.startsWith('/profile')
                ? 'bg-zinc-800/90 text-white'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <BookmarkIcon className="h-3.5 w-3.5" />
            <span>Saved</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            title="Verify authentic steganographic metadata"
          >
            <ShieldCheckIcon className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Verify DNA</span>
          </button>

          <Link
            to="/create"
            className="flex items-center gap-1 rounded-lg bg-white px-3.5 py-1.5 text-xs sm:text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 shadow-sm active:scale-95"
          >
            <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Create</span>
          </Link>
        </nav>
      </div>

      {showScanner && (
        <ProvenanceScannerModal onClose={() => setShowScanner(false)} />
      )}
    </header>
  );
};

export default Navbar;
