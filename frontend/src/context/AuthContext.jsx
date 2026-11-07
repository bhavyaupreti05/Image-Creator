import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

const DEFAULT_USERS = [
  {
    username: '@bhavya',
    name: 'Bhavya Upreti',
    bio: 'Founding Prompt Engineer & Creative Director at Aura Studio. Exploring latent spaces and DAG prompt lineages.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    credits: 240,
    following: ['@elena', '@kai', '@maya'],
    isVerified: true,
  },
  {
    username: '@elena',
    name: 'Elena Rostova',
    bio: 'Bioluminescent cyber aesthetics & cinematic anime worldbuilding.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    credits: 180,
    following: ['@bhavya', '@zane'],
    isVerified: true,
  },
  {
    username: '@kai',
    name: 'Kai Chen',
    bio: 'Surrealist chromatic glass and architectural monolith generator.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    credits: 120,
    following: ['@bhavya'],
    isVerified: false,
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'remix',
    actor: '@elena',
    actorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=128&q=80',
    message: 'remixed your "Neo-Tokyo Rain Boulevard" prompt into an anime mecha branch',
    time: '10m ago',
    read: false,
    targetId: 'seed-root-1',
  },
  {
    id: 'notif-2',
    type: 'marketplace',
    actor: '@zane',
    actorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
    message: 'unlocked your Cyberpunk Lighting Recipe Formula (+10 Aura Credits earned)',
    time: '1h ago',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'follow',
    actor: '@maya',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80',
    message: 'started following your creative portfolio',
    time: '3h ago',
    read: false,
  },
  {
    id: 'notif-4',
    type: 'like',
    actor: '@kai',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
    message: 'liked your Chromatic Glass Monolith artwork',
    time: '5h ago',
    read: true,
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('aura_auth_user');
      return stored ? JSON.parse(stored) : DEFAULT_USERS[0];
    } catch {
      return DEFAULT_USERS[0];
    }
  });

  const [unlockedRecipes, setUnlockedRecipes] = useState(() => {
    try {
      const stored = localStorage.getItem('aura_unlocked_recipes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('aura_notifications');
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('aura_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('aura_auth_user');
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_notifications', JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_unlocked_recipes', JSON.stringify(unlockedRecipes));
    } catch {
      // ignore
    }
  }, [unlockedRecipes]);

  const loginWithDemo = (demoUsername) => {
    const found = DEFAULT_USERS.find((u) => u.username === demoUsername) || DEFAULT_USERS[0];
    setUser(found);
    toast.success(`Signed in as ${found.name} (${found.username})`);
  };

  const loginCustom = (username, displayName, bio) => {
    const cleanUsername = username.startsWith('@') ? username : `@${username}`;
    const newUser = {
      username: cleanUsername,
      name: displayName || cleanUsername.replace('@', ''),
      bio: bio || 'AI Creator on Aura Studio',
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername.replace('@', '')}`,
      credits: 150,
      following: [],
      isVerified: false,
    };
    setUser(newUser);
    toast.success(`Welcome to Aura Studio, ${newUser.name}!`);
  };

  const logout = () => {
    setUser(null);
    toast('Signed out', { icon: '👋' });
  };

  const toggleFollow = (targetUsername) => {
    if (!user) {
      toast.error('Please sign in to follow creators');
      return false;
    }
    const cleanTarget = targetUsername.startsWith('@') ? targetUsername : `@${targetUsername}`;
    if (cleanTarget === user.username) {
      toast.error('You cannot follow yourself');
      return false;
    }

    const isFollowing = user.following.includes(cleanTarget);
    let nextFollowing;
    if (isFollowing) {
      nextFollowing = user.following.filter((u) => u !== cleanTarget);
      toast.success(`Unfollowed ${cleanTarget}`);
    } else {
      nextFollowing = [...user.following, cleanTarget];
      toast.success(`Following ${cleanTarget}`);

      // Add a simulated follow back notification
      const followNotif = {
        id: `notif-${Date.now()}`,
        type: 'follow',
        actor: cleanTarget,
        actorAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanTarget}`,
        message: `reciprocated by checking your profile`,
        time: 'Just now',
        read: false,
      };
      setNotifications((prev) => [followNotif, ...prev]);
    }

    setUser({ ...user, following: nextFollowing });
    return !isFollowing;
  };

  const unlockRecipeFormula = (postId, postPrompt, author, price = 10) => {
    if (!user) {
      toast.error('Please sign in to unlock prompt formulas');
      return false;
    }

    if (unlockedRecipes[postId]) {
      return true;
    }

    if (user.credits < price) {
      toast.error(`Insufficient Aura Credits. You need ${price} credits.`);
      return false;
    }

    // Deduct credits
    const nextCredits = user.credits - price;
    setUser({ ...user, credits: nextCredits });

    // Mark recipe unlocked
    const nextUnlocked = {
      ...unlockedRecipes,
      [postId]: {
        unlockedAt: new Date().toISOString(),
        author,
        price,
      },
    };
    setUnlockedRecipes(nextUnlocked);
    toast.success(`Unlocked recipe formula for 10 Aura Credits! (-${price})`);
    return true;
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        DEFAULT_USERS,
        loginWithDemo,
        loginCustom,
        logout,
        toggleFollow,
        unlockRecipeFormula,
        unlockedRecipes,
        notifications,
        markAllNotificationsRead,
        unreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
