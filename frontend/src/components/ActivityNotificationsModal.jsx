import { motion, AnimatePresence } from 'framer-motion';
import { CloseIcon, BellIcon, BranchIcon, HeartIcon, UserIcon, CoinsIcon, CheckIcon } from './Icons';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ActivityNotificationsModal = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsRead, unreadCount } = useAuth();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'remix':
        return <BranchIcon className="h-4 w-4 text-emerald-400" />;
      case 'like':
        return <HeartIcon className="h-4 w-4 text-rose-400" filled />;
      case 'follow':
        return <UserIcon className="h-4 w-4 text-cyan-400" />;
      case 'marketplace':
        return <CoinsIcon className="h-4 w-4 text-amber-400" />;
      default:
        return <BellIcon className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 sm:top-14">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Dropdown Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 p-4">
            <div className="flex items-center gap-2">
              <BellIcon className="h-4 w-4 text-white" />
              <h3 className="text-sm font-semibold text-white">Activity & Remix Feed</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-[11px] font-medium text-zinc-400 hover:text-white transition flex items-center gap-1"
                >
                  <CheckIcon className="h-3 w-3" />
                  <span>Mark read</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-800/50 p-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                No recent activity. Remix an artwork to start conversations!
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 transition rounded-xl ${
                    item.read ? 'opacity-70 hover:opacity-100 hover:bg-zinc-800/30' : 'bg-zinc-800/50 hover:bg-zinc-800/70'
                  }`}
                >
                  <div className="relative mt-0.5">
                    <img
                      src={item.actorAvatar}
                      alt={item.actor}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-zinc-700"
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700">
                      {getIcon(item.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-200">
                      <Link
                        to={`/profile/${item.actor.replace('@', '')}`}
                        onClick={onClose}
                        className="font-semibold text-white hover:underline"
                      >
                        {item.actor}
                      </Link>{' '}
                      <span className="text-zinc-400">{item.message}</span>
                    </p>
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-800 bg-zinc-950/60 p-2.5 text-center">
            <span className="text-[11px] text-zinc-400">
              Live notifications stream automatically on remix forks & tips
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ActivityNotificationsModal;
