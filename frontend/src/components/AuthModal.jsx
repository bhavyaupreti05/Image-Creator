import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseIcon, UserIcon, CheckIcon, SparklesIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { user, DEFAULT_USERS, loginWithDemo, loginCustom, logout } = useAuth();
  const [mode, setMode] = useState('demo'); // 'demo' | 'custom'
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    loginCustom(username.trim(), name.trim(), bio.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200">
                <UserIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Creator Account</h3>
                <p className="text-xs text-zinc-400">Sign in to unlock private vaults & marketplace recipes</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Current Signed In View */}
          {user && (
            <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-zinc-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">{user.name}</span>
                      <span className="text-xs text-zinc-400">{user.username}</span>
                    </div>
                    <p className="text-xs text-amber-400 font-medium">⚡ {user.credits} Aura Credits</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="mt-5 grid grid-cols-2 rounded-xl bg-zinc-950 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => setMode('demo')}
              className={`rounded-lg py-1.5 text-xs font-medium transition ${
                mode === 'demo' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Quick Demo Profiles
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`rounded-lg py-1.5 text-xs font-medium transition ${
                mode === 'custom' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Custom Account
            </button>
          </div>

          {/* Demo Profiles */}
          {mode === 'demo' ? (
            <div className="mt-4 space-y-2.5">
              <p className="text-[11px] text-zinc-400">Switch between verified community creator personas:</p>
              {DEFAULT_USERS.map((u) => {
                const isActive = user?.username === u.username;
                return (
                  <button
                    key={u.username}
                    type="button"
                    onClick={() => {
                      loginWithDemo(u.username);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition ${
                      isActive
                        ? 'border-zinc-500 bg-zinc-800/80 ring-1 ring-zinc-500'
                        : 'border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white">{u.name}</span>
                          <span className="text-[11px] text-zinc-400">{u.username}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">{u.bio}</p>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-950">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-400 font-medium">Select</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Custom Account Form */
            <form onSubmit={handleCustomSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="@yourhandle"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Creator Bio</label>
                <textarea
                  rows={2}
                  placeholder="What styles, latent spaces, or prompts do you explore?"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-white py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-95 shadow-sm"
              >
                Create & Sign In (150 Free Credits)
              </button>
            </form>
          )}

          {/* Cloud Auth Readiness Badge */}
          <div className="mt-5 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-[11px]">
              <SparklesIcon className="h-3.5 w-3.5 text-amber-400" />
              <span>Authentication & Private Vaults ready</span>
            </div>
            <p className="mt-1 text-[10px] text-zinc-400">
              Compatible with Clerk, Auth0, and Supabase JWT credentials.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
