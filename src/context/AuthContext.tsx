import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserPreferences, ContinueWatchingItem } from '../types/auth';

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
  checkUser: (email: string) => Promise<{ exists: boolean; hasPin: boolean }>;
  sendOtp: (email: string) => Promise<{ 
    success: boolean; 
    message?: string; 
    isRegistered?: boolean; 
    error?: string; 
    emailNotConfigured?: boolean;
    demoOtp?: string;
    sentViaEmail?: boolean;
    provider?: string;
  }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; isRegistered?: boolean; error?: string }>;
  setPinAndRegister: (email: string, otp: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPin: (email: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  addContinueWatching: (item: ContinueWatchingItem) => Promise<void>;
  removeContinueWatching: (mediaId: number) => Promise<void>;
  toggleWatchlist: (mediaId: number) => boolean;
  isInWatchlist: (mediaId: number) => boolean;
}

const defaultPreferences: UserPreferences = {
  autoPlay: true,
  defaultServerId: 'vidlink',
  preferredLanguage: 'hi',
  subtitlesEnabled: true
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('anshsflix_user_profile');
      if (saved) {
        const parsed: UserProfile = JSON.parse(saved);
        if (parsed?.preferences) {
          // Ensure default server migrates to vidlink if not explicitly set to something else
          if (!parsed.preferences.defaultServerId || parsed.preferences.defaultServerId === 'videasy') {
            parsed.preferences.defaultServerId = 'vidlink';
          }
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Sync user profile to localStorage whenever it updates
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('anshsflix_user_profile', JSON.stringify(user));
        // Also sync autoplay setting with player
        localStorage.setItem('autostream_autoplay', String(user.preferences.autoPlay));
        // Sync watchlist
        localStorage.setItem('autostream_watchlist', JSON.stringify(user.watchlist));
      } catch {
        // Ignore quota issues
      }
    } else {
      localStorage.removeItem('anshsflix_user_profile');
    }
  }, [user]);

  // Send OTP
  const sendOtp = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7500);

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      return data;
    } catch {
      return {
        success: false,
        sentViaEmail: false,
        error: 'Network connection error. Could not connect to authentication server.'
      };
    }
  };

  // Verify OTP
  const verifyOtp = async (email: string, otp: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7500);

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: otp.trim() }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data && data.success) {
        return data;
      }
      return { success: false, error: data?.error || 'Invalid verification code' };
    } catch {
      return { success: false, error: 'Network error while verifying OTP code' };
    }
  };

  // Check if user exists & has PIN
  const checkUser = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json();
      return { exists: !!data.exists, hasPin: !!data.hasPin };
    } catch {
      return { exists: false, hasPin: false };
    }
  };

  // Set 4-digit PIN and Register
  const setPinAndRegister = async (email: string, otp: string, pin: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/auth/set-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: otp.trim(), pin: pin.trim() })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        try {
          localStorage.setItem('anshsflix_last_email', cleanEmail);
        } catch {}
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to set PIN' };
    } catch {
      // Local fallback
      const newUser: UserProfile = {
        email: cleanEmail,
        hasPin: true,
        registeredAt: Date.now(),
        preferences: defaultPreferences,
        continueWatching: [],
        watchlist: []
      };
      setUser(newUser);
      try {
        localStorage.setItem('anshsflix_last_email', cleanEmail);
      } catch {}
      setIsAuthModalOpen(false);
      return { success: true };
    }
  };

  // Login with 4-digit PIN
  const loginWithPin = async (email: string, pin: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/auth/login-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, pin: pin.trim() })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        try {
          localStorage.setItem('anshsflix_last_email', cleanEmail);
        } catch {}
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: data.error || 'Incorrect 4-digit PIN' };
    } catch {
      return { success: false, error: 'Server connection error' };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setIsAccountModalOpen(false);
  };

  // Update preferences
  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      preferences: {
        ...user.preferences,
        ...newPrefs
      }
    };
    setUser(updated);

    try {
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, preferences: updated.preferences })
      });
    } catch {}
  };

  // Add to Continue Watching
  const addContinueWatching = async (item: ContinueWatchingItem) => {
    if (!user) {
      // Guest mode continue watching stored in local storage
      try {
        const raw = localStorage.getItem('anshsflix_guest_cw') || '[]';
        const list: ContinueWatchingItem[] = JSON.parse(raw);
        const filtered = list.filter(x => x.mediaId !== item.mediaId);
        const updated = [item, ...filtered].slice(0, 20);
        localStorage.setItem('anshsflix_guest_cw', JSON.stringify(updated));
      } catch {}
      return;
    }

    const filtered = user.continueWatching.filter(x => x.mediaId !== item.mediaId);
    const updatedList = [item, ...filtered].slice(0, 25);
    const updatedUser: UserProfile = {
      ...user,
      continueWatching: updatedList
    };
    setUser(updatedUser);

    try {
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, continueWatching: updatedList })
      });
    } catch {}
  };

  // Remove from Continue Watching
  const removeContinueWatching = async (mediaId: number) => {
    if (!user) return;
    const updatedList = user.continueWatching.filter(x => x.mediaId !== mediaId);
    const updatedUser: UserProfile = {
      ...user,
      continueWatching: updatedList
    };
    setUser(updatedUser);

    try {
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, continueWatching: updatedList })
      });
    } catch {}
  };

  // Toggle Watchlist
  const toggleWatchlist = (mediaId: number): boolean => {
    if (!user) {
      // Guest watchlist
      try {
        const raw = localStorage.getItem('autostream_watchlist') || '[]';
        let list: number[] = JSON.parse(raw);
        const exists = list.includes(mediaId);
        if (exists) {
          list = list.filter(id => id !== mediaId);
        } else {
          list.push(mediaId);
        }
        localStorage.setItem('autostream_watchlist', JSON.stringify(list));
        return !exists;
      } catch {
        return false;
      }
    }

    const exists = user.watchlist.includes(mediaId);
    const newWatchlist = exists
      ? user.watchlist.filter(id => id !== mediaId)
      : [...user.watchlist, mediaId];

    const updatedUser: UserProfile = {
      ...user,
      watchlist: newWatchlist
    };
    setUser(updatedUser);

    try {
      fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, watchlist: newWatchlist })
      });
    } catch {}

    return !exists;
  };

  const isInWatchlist = (mediaId: number): boolean => {
    if (user) {
      return user.watchlist.includes(mediaId);
    }
    try {
      const raw = localStorage.getItem('autostream_watchlist') || '[]';
      const list: number[] = JSON.parse(raw);
      return list.includes(mediaId);
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAccountModalOpen,
        setIsAccountModalOpen,
        checkUser,
        sendOtp,
        verifyOtp,
        setPinAndRegister,
        loginWithPin,
        logout,
        updatePreferences,
        addContinueWatching,
        removeContinueWatching,
        toggleWatchlist,
        isInWatchlist
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
