import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProvenanceScannerModal from './ProvenanceScannerModal';
import AuthModal from './AuthModal';
import ActivityNotificationsModal from './ActivityNotificationsModal';
import { ShieldCheckIcon, BookmarkIcon, PlusIcon, BellIcon, UserIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const { user, unreadCount } = useAuth();
  const location = useLocation();

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
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
            className={`rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium transition ${
              isCurrent('/')
                ? 'bg-zinc-800/90 text-white'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            Explore
          </Link>

          <Link
            to="/profile"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium transition ${
              location.pathname.startsWith('/profile')
                ? 'bg-zinc-800/90 text-white'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <BookmarkIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Vault</span>
          </Link>

          {/* Activity / Remix Notifications */}
          <button
            type="button"
            onClick={() => setShowActivityModal(true)}
            className="relative flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/70 p-1.5 text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            title="Activity & Remix Notifications"
          >
            <BellIcon className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-zinc-950 shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Digital DNA Verifier */}
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            title="Verify authentic steganographic metadata"
          >
            <ShieldCheckIcon className="h-3.5 w-3.5 text-zinc-400" />
            <span>Verify DNA</span>
          </button>

          {/* Creator Account Pill */}
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
          >
            {user ? (
              <>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-5 w-5 rounded-full object-cover ring-1 ring-zinc-700"
                />
                <span className="hidden sm:inline text-zinc-200">{user.username}</span>
                <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[10px] font-semibold text-amber-300">
                  ⚡{user.credits}
                </span>
              </>
            ) : (
              <>
                <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
                <span>Sign In</span>
              </>
            )}
          </button>

          {/* Create Button */}
          <Link
            to="/create"
            className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 shadow-sm active:scale-95"
          >
            <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Create</span>
          </Link>
        </nav>
      </div>

      {showScanner && (
        <ProvenanceScannerModal onClose={() => setShowScanner(false)} />
      )}

      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      )}

      {showActivityModal && (
        <ActivityNotificationsModal
          isOpen={showActivityModal}
          onClose={() => setShowActivityModal(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
