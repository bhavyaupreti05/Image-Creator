import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProvenanceScannerModal from './ProvenanceScannerModal';

const Navbar = () => {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 text-xs font-black text-white shadow-md">
            ✦
          </span>
          <span>Aura Gallery</span>
        </Link>
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link to="/" className="rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white sm:text-sm sm:px-4 sm:py-2">
            Exhibition
          </Link>
          <Link to="/profile" className="rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white sm:text-sm sm:px-4 sm:py-2">
            🔖 Moodboard
          </Link>
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 sm:px-3.5 sm:py-2"
            title="Verify Authentic Steganographic Artwork DNA"
          >
            <span>🛡️</span>
            <span className="hidden sm:inline">DNA Verifier</span>
          </button>
          <Link to="/create" className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 sm:text-sm sm:px-4 sm:py-2">
            + Studio
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
