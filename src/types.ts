export interface Provider {
  id: string;
  name: string;
  category: 'primary' | 'alternative' | 'multilang' | 'international';
  url: string;
  domain: string;
  countryCode: string;
  idType: 'tmdb' | 'imdb';
  urlFormat: string;
  extraParams?: string;
  quality: '4K' | '1080p' | '720p' | 'Auto';
  supportedMedia: ('movie' | 'tv')[];
  specialFeatures: string[];
  notes?: string;
}

export interface MediaItem {
  id: number;
  imdbId?: string;
  title: string;
  type: 'movie' | 'tv';
  year: number;
  overview: string;
  poster: string;
  backdrop: string;
  rating?: number;
  genres?: string[];
  duration?: string;
  language?: string;
  originalLanguage?: string;
  releaseDate?: string;
  tagline?: string;
  seasons?: number;
  episodesPerSeason?: number;
  episodesList?: {
    season: number;
    episode: number;
    title: string;
    runtime?: string;
    still?: string | null;
    overview?: string;
  }[];
  recommendations?: MediaItem[];
  featured?: boolean;
  platform?: string;
  streamingPlatform?: string;
}

export interface WatchHistoryItem {
  mediaId: number;
  title: string;
  poster: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  providerId: string;
  watchedAt: number;
}

export interface NetworkRequestItem {
  id: string;
  url: string;
  method: string;
  status: number;
  type: 'document' | 'xhr' | 'script' | 'media' | 'image';
  size: string;
  time: string;
  initiator: string;
  roleDescription: string;
  headers?: Record<string, string>;
  responsePreview?: string;
}

export interface ArchitectureNode {
  id: string;
  title: string;
  subtitle: string;
  category: 'frontend' | 'metadata' | 'embed_layer' | 'resolver' | 'hoster' | 'client';
  description: string;
  techStack: string[];
  role: string;
  codeSnippet?: string;
}
