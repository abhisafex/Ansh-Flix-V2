export interface UserPreferences {
  autoPlay: boolean;
  defaultServerId: string;
  preferredLanguage?: string;
  subtitlesEnabled?: boolean;
}

export interface ContinueWatchingItem {
  mediaId: number;
  title: string;
  poster?: string;
  backdrop?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  providerId?: string;
  watchedAt: number;
  progressPercent?: number;
}

export interface UserProfile {
  email: string;
  hasPin: boolean;
  registeredAt: number;
  preferences: UserPreferences;
  continueWatching: ContinueWatchingItem[];
  watchlist: number[]; // media IDs
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoggedIn: boolean;
}
