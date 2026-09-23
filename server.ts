import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { SAMPLE_MEDIA } from './src/data/sampleMedia';

dotenv.config();

const app = express();
// Dynamic PORT for Render / Cloud deployments (Render injects PORT env variable)
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Built-in TMDB API key fallback to guarantee live functionality everywhere
const TMDB_API_KEY = (process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.trim() !== '')
  ? process.env.TMDB_API_KEY.trim()
  : 'b50c2791febd8f854daa2679cce10def';

app.use(express.json());

// Performance & Render Free-Tier Bandwidth Optimization:
// Attach Cache-Control headers to read-only API requests (10 minutes public cache)
app.use((req, res, next) => {
  if (req.method === 'GET' && (req.path.startsWith('/api/tmdb') || req.path.startsWith('/api/poster'))) {
    res.setHeader('Cache-Control', 'public, max-age=600, stale-while-revalidate=1800');
  }
  next();
});

// Genre mapping dictionary
const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics'
};

// In-memory cache for high performance & reducing TMDB load
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

function getCached(key: string) {
  const item = cache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data;
  }
  return null;
}

function setCached(key: string, data: any) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

const GENRE_SLUG_TO_ID: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  scifi: 878,
  thriller: 53,
  war: 10752,
  western: 37
};

const LANG_CODE_TO_NAME: Record<string, string> = {
  hi: 'Hindi',
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
  ta: 'Tamil',
  te: 'Telugu',
  es: 'Spanish',
  fr: 'French',
  pa: 'Punjabi',
  ml: 'Malayalam',
  de: 'German',
  it: 'Italian'
};

const PLATFORM_CONFIG: Record<string, {
  prov: string;
  net?: string;
  region: string;
  name: string;
}> = {
  netflix: { prov: '8', net: '213', region: 'IN', name: 'Netflix' },
  prime: { prov: '9|119', net: '1024', region: 'IN', name: 'Prime Video' },
  disney: { prov: '337|122', net: '2739', region: 'IN', name: 'Disney+ Hotstar' },
  appletv: { prov: '350', net: '2552', region: 'IN', name: 'Apple TV+' },
  hbomax: { prov: '384|1899', net: '49', region: 'US', name: 'HBO Max' },
  jiocinema: { prov: '220', region: 'IN', name: 'JioCinema' },
  sonyliv: { prov: '237', region: 'IN', name: 'SonyLIV' },
  zee5: { prov: '232', region: 'IN', name: 'Zee5' },
  paramount: { prov: '531', net: '4330', region: 'US', name: 'Paramount+' },
  hulu: { prov: '15', net: '453', region: 'US', name: 'Hulu' }
};

// Transform TMDB item to our standardized MediaItem structure
function formatTmdbItem(raw: any, explicitType?: 'movie' | 'tv', platformMeta?: { platform?: string; streamingPlatform?: string }): any {
  const type: 'movie' | 'tv' = explicitType || (raw.media_type === 'tv' || raw.first_air_date ? 'tv' : 'movie');
  const title = raw.title || raw.name || 'Untitled';
  const releaseDate = raw.release_date || raw.first_air_date || '';
  const year = releaseDate ? new Date(releaseDate).getFullYear() : (raw.year || 2024);
  const rating = raw.vote_average ? Math.round(raw.vote_average * 10) / 10 : 7.5;
  
  const poster = raw.poster_path 
    ? `https://image.tmdb.org/t/p/w500${raw.poster_path}`
    : raw.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';

  const backdrop = raw.backdrop_path
    ? `https://image.tmdb.org/t/p/original${raw.backdrop_path}`
    : (raw.backdrop || poster);

  const genres: string[] = [];
  if (Array.isArray(raw.genre_ids)) {
    raw.genre_ids.forEach((gid: number) => {
      if (GENRE_MAP[gid]) genres.push(GENRE_MAP[gid]);
    });
  } else if (Array.isArray(raw.genres)) {
    raw.genres.forEach((g: any) => {
      if (typeof g === 'string') genres.push(g);
      else if (g && g.name) genres.push(g.name);
    });
  }

  const langCode = raw.original_language || '';
  const language = LANG_CODE_TO_NAME[langCode] || (langCode ? langCode.toUpperCase() : 'English');

  return {
    id: raw.id,
    imdbId: raw.imdbId || raw.external_ids?.imdb_id,
    title,
    type,
    year: isNaN(year) ? 2024 : year,
    overview: raw.overview || 'No synopsis available for this title.',
    poster,
    backdrop,
    rating,
    genres: genres.length > 0 ? genres.slice(0, 3) : (raw.genres || ['Drama', 'Cinema']),
    tagline: raw.tagline || '',
    duration: raw.runtime ? `${Math.floor(raw.runtime / 60)}h ${raw.runtime % 60}m` : (raw.duration || (type === 'movie' ? '2h 05m' : undefined)),
    seasons: raw.number_of_seasons || raw.seasons || (type === 'tv' ? 1 : undefined),
    episodesPerSeason: raw.number_of_episodes || raw.episodesPerSeason || (type === 'tv' ? 10 : undefined),
    featured: raw.popularity > 150 || raw.vote_average > 8.2,
    originalLanguage: langCode,
    language,
    releaseDate: releaseDate || undefined,
    platform: platformMeta?.platform || raw.platform,
    streamingPlatform: platformMeta?.streamingPlatform || raw.streamingPlatform
  };
}

// Status & TMDB Configuration check
app.get(['/api/tmdb/status', '/tmdb/status'], (req: Request, res: Response) => {
  const hasKey = Boolean(TMDB_API_KEY && TMDB_API_KEY.trim() !== '');
  res.json({
    configured: hasKey,
    keyConfigured: hasKey,
    providerCount: 20,
    totalIndexedTitles: '1,400,000+',
    timestamp: new Date().toISOString()
  });
});

// Helper for client & fallback catalog filtering
function filterSampleMedia(category = 'trending', genre = '', language = '', mediaType = '', platform = '') {
  let filtered = [...SAMPLE_MEDIA];

  if (platform && platform !== 'all') {
    const pLower = platform.toLowerCase();
    filtered = filtered.filter(m => 
      (m.platform && m.platform.toLowerCase() === pLower) ||
      (m.streamingPlatform && m.streamingPlatform.toLowerCase().includes(pLower))
    );
  }

  if (mediaType === 'movie') filtered = filtered.filter(m => m.type === 'movie');
  else if (mediaType === 'tv') filtered = filtered.filter(m => m.type === 'tv');

  if (category === 'movies' || category === 'popular_movies') filtered = filtered.filter(m => m.type === 'movie');
  else if (category === 'tv' || category === 'popular_tv') filtered = filtered.filter(m => m.type === 'tv');
  else if (category === 'anime') filtered = filtered.filter(m => m.genres?.includes('Animation') || m.originalLanguage === 'ja');
  else if (category === 'scifi') filtered = filtered.filter(m => m.genres?.includes('Sci-Fi'));
  else if (category === 'hindi') filtered = filtered.filter(m => m.originalLanguage === 'hi' || m.language === 'Hindi');
  else if (category === 'korean') filtered = filtered.filter(m => m.originalLanguage === 'ko' || m.language === 'Korean');
  else if (category === 'south_indian') filtered = filtered.filter(m => m.originalLanguage === 'te' || m.originalLanguage === 'ta' || m.language === 'Telugu' || m.language === 'Tamil');
  else if (category === 'action') filtered = filtered.filter(m => m.genres?.includes('Action'));
  else if (category === 'comedy') filtered = filtered.filter(m => m.genres?.includes('Comedy'));
  else if (category === 'horror') filtered = filtered.filter(m => m.genres?.includes('Horror'));
  else if (category === 'romance') filtered = filtered.filter(m => m.genres?.includes('Romance'));
  else if (category === 'new_releases') filtered = filtered.filter(m => m.type === 'movie' && (m.year >= 2024 || m.featured));
  else if (category === 'top_rated_movies' || category === '4k') filtered = filtered.filter(m => (m.rating || 0) >= 7.8);

  if (genre && genre !== 'all') {
    const gLower = genre.toLowerCase();
    filtered = filtered.filter(m => m.genres?.some(g => g.toLowerCase().includes(gLower)));
  }

  if (language && language !== 'all') {
    const lLower = language.toLowerCase();
    filtered = filtered.filter(m => 
      (m.originalLanguage && m.originalLanguage.toLowerCase() === lLower) ||
      (m.language && m.language.toLowerCase().includes(lLower))
    );
  }

  return filtered;
}

// Dynamic Catalog Endpoint with category, genre, language, type & streaming platform (OTT) filtering
app.get(['/api/tmdb/catalog', '/tmdb/catalog'], async (req: Request, res: Response) => {
  const apiKey = TMDB_API_KEY;
  const category = (req.query.category as string) || 'trending';
  const genre = (req.query.genre as string) || '';
  const language = (req.query.language as string) || '';
  const mediaType = (req.query.type as string) || '';
  const platform = ((req.query.platform as string) || '').toLowerCase();
  const page = parseInt(req.query.page as string) || 1;

  if (!apiKey) {
    const filtered = filterSampleMedia(category, genre, language, mediaType, platform);
    return res.json({
      live: false,
      page: 1,
      totalPages: 1,
      totalResults: filtered.length,
      results: filtered
    });
  }

  const cacheKey = `cat_${category}_${genre}_${language}_${mediaType}_${platform}_${page}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // --- Dedicated Streaming Provider / OTT Platform Routing ---
  if (platform && platform !== 'all' && PLATFORM_CONFIG[platform]) {
    const pConf = PLATFORM_CONFIG[platform];
    const genreId = GENRE_SLUG_TO_ID[genre.toLowerCase()] || 
      (category === 'action' ? 28 : category === 'scifi' ? 878 : category === 'anime' ? 16 : category === 'comedy' ? 35 : category === 'horror' ? 27 : category === 'romance' ? 10749 : undefined);
    
    let langCode = language || 
      (category === 'hindi' ? 'hi' : category === 'korean' ? 'ko' : category === 'south_indian' ? 'te|ta' : category === 'anime' ? 'ja' : '');

    try {
      if (mediaType === 'movie') {
        let mUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}&sort_by=popularity.desc&with_watch_providers=${pConf.prov}&watch_region=${pConf.region}`;
        if (genreId) mUrl += `&with_genres=${genreId}`;
        if (langCode && langCode !== 'all') mUrl += `&with_original_language=${langCode}`;

        let mRes = await fetch(mUrl);
        let mData = mRes.ok ? await mRes.json() : null;

        // If regional catalog is small and not US, query US for a fuller catalog
        if ((!mData || !mData.results || mData.results.length < 5) && pConf.region !== 'US') {
          let usUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}&sort_by=popularity.desc&with_watch_providers=${pConf.prov}&watch_region=US`;
          if (genreId) usUrl += `&with_genres=${genreId}`;
          if (langCode && langCode !== 'all') usUrl += `&with_original_language=${langCode}`;
          const usRes = await fetch(usUrl);
          if (usRes.ok) {
            const usData = await usRes.json();
            const combined = [...(mData?.results || []), ...(usData.results || [])];
            const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
            mData = { results: unique, total_pages: usData.total_pages || 1, total_results: unique.length };
          }
        }

        const formatted = (mData?.results || [])
          .filter((item: any) => item.poster_path)
          .map((item: any) => formatTmdbItem(item, 'movie', { platform, streamingPlatform: pConf.name }));

        const fallback = formatted.length === 0 ? filterSampleMedia(category, genre, language, mediaType, platform) : formatted;
        const payload = {
          live: true,
          page: mData?.page || page,
          totalPages: mData?.total_pages || 1,
          totalResults: mData?.total_results || fallback.length,
          results: fallback
        };
        setCached(cacheKey, payload);
        return res.json(payload);
      } else if (mediaType === 'tv') {
        let tUrl = pConf.net
          ? `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&page=${page}&sort_by=popularity.desc&with_networks=${pConf.net}`
          : `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&page=${page}&sort_by=popularity.desc&with_watch_providers=${pConf.prov}&watch_region=${pConf.region}`;
        if (genreId) tUrl += `&with_genres=${genreId}`;
        if (langCode && langCode !== 'all') tUrl += `&with_original_language=${langCode}`;

        const tRes = await fetch(tUrl);
        const tData = tRes.ok ? await tRes.json() : null;
        const formatted = (tData?.results || [])
          .filter((item: any) => item.poster_path)
          .map((item: any) => formatTmdbItem(item, 'tv', { platform, streamingPlatform: pConf.name }));

        const fallback = formatted.length === 0 ? filterSampleMedia(category, genre, language, mediaType, platform) : formatted;
        const payload = {
          live: true,
          page: tData?.page || page,
          totalPages: tData?.total_pages || 1,
          totalResults: tData?.total_results || fallback.length,
          results: fallback
        };
        setCached(cacheKey, payload);
        return res.json(payload);
      } else {
        // 'all' or empty - Fetch both movies and TV shows from this streaming provider!
        let mUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}&sort_by=popularity.desc&with_watch_providers=${pConf.prov}&watch_region=${pConf.region}`;
        if (genreId) mUrl += `&with_genres=${genreId}`;
        if (langCode && langCode !== 'all') mUrl += `&with_original_language=${langCode}`;

        let tUrl = pConf.net
          ? `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&page=${page}&sort_by=popularity.desc&with_networks=${pConf.net}`
          : `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&page=${page}&sort_by=popularity.desc&with_watch_providers=${pConf.prov}&watch_region=${pConf.region}`;
        if (genreId) tUrl += `&with_genres=${genreId}`;
        if (langCode && langCode !== 'all') tUrl += `&with_original_language=${langCode}`;

        const [mRes, tRes] = await Promise.all([fetch(mUrl), fetch(tUrl)]);
        const [mData, tData] = await Promise.all([
          mRes.ok ? mRes.json() : { results: [] },
          tRes.ok ? tRes.json() : { results: [] }
        ]);

        const mList = (mData.results || [])
          .filter((i: any) => i.poster_path)
          .map((i: any) => formatTmdbItem(i, 'movie', { platform, streamingPlatform: pConf.name }));
        const tList = (tData.results || [])
          .filter((i: any) => i.poster_path)
          .map((i: any) => formatTmdbItem(i, 'tv', { platform, streamingPlatform: pConf.name }));

        // Interleave movies and TV series
        const combined: any[] = [];
        const maxLen = Math.max(mList.length, tList.length);
        for (let idx = 0; idx < maxLen; idx++) {
          if (idx < mList.length) combined.push(mList[idx]);
          if (idx < tList.length) combined.push(tList[idx]);
        }

        const fallback = combined.length === 0 ? filterSampleMedia(category, genre, language, mediaType, platform) : combined;
        const payload = {
          live: true,
          page,
          totalPages: Math.max(mData.total_pages || 1, tData.total_pages || 1),
          totalResults: (mData.total_results || 0) + (tData.total_results || 0) || fallback.length,
          results: fallback
        };
        setCached(cacheKey, payload);
        return res.json(payload);
      }
    } catch (platformErr: any) {
      const fallback = filterSampleMedia(category, genre, language, mediaType, platform);
      return res.json({
        live: false,
        page: 1,
        totalPages: 1,
        totalResults: fallback.length,
        results: fallback
      });
    }
  }

  let tmdbUrl = '';
  let explicitType: 'movie' | 'tv' | undefined = undefined;

  // Determine media endpoint
  const targetType = mediaType === 'tv' || category === 'popular_tv' || category === 'tv' || category === 'top_rated_tv' || category === 'on_the_air' || category === 'anime' ? 'tv' : 'movie';
  explicitType = (category === 'trending' && !genre && !language && !mediaType) ? undefined : targetType;

  // --- Dedicated "New Releases" Handler: Prioritizes Bollywood (Hindi) movies FIRST ---
  if (category === 'new_releases') {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const past21 = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
    const past21Str = past21.toISOString().split('T')[0];

    const genreId = genre ? GENRE_SLUG_TO_ID[genre.toLowerCase()] : undefined;

    // If a specific non-Hindi language is requested, respect it
    if (language && language !== 'all' && language !== 'hi') {
      let discoverParams = `api_key=${apiKey}&page=${page}&sort_by=popularity.desc&primary_release_date.gte=${past21Str}&primary_release_date.lte=${todayStr}&with_original_language=${language}`;
      if (genreId) discoverParams += `&with_genres=${genreId}`;
      tmdbUrl = `https://api.themoviedb.org/3/discover/movie?${discoverParams}`;
      explicitType = 'movie';
    } else {
      // Prioritize Bollywood (Hindi) movies FIRST, then append global new releases!
      try {
        let hindiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}&sort_by=popularity.desc&primary_release_date.gte=${past21Str}&primary_release_date.lte=${todayStr}&with_original_language=hi`;
        let globalUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}&sort_by=popularity.desc&primary_release_date.gte=${past21Str}&primary_release_date.lte=${todayStr}`;
        if (genreId) {
          hindiUrl += `&with_genres=${genreId}`;
          globalUrl += `&with_genres=${genreId}`;
        }

        const [hindiRes, globalRes] = await Promise.all([fetch(hindiUrl), fetch(globalUrl)]);
        const hindiData = hindiRes.ok ? await hindiRes.json() : null;
        const globalData = globalRes.ok ? await globalRes.json() : null;

        const hindiItems = (hindiData?.results || [])
          .filter((item: any) => item.poster_path)
          .map((item: any) => formatTmdbItem(item, 'movie'));

        const hindiIds = new Set(hindiItems.map((item: any) => item.id));

        const globalItems = (globalData?.results || [])
          .filter((item: any) => item.poster_path && !hindiIds.has(item.id))
          .map((item: any) => formatTmdbItem(item, 'movie'));

        // If user specifically filtered language=hi, show only Hindi
        const combined = (language === 'hi') ? hindiItems : [...hindiItems, ...globalItems];
        const fallback = combined.length === 0 ? filterSampleMedia(category, genre, language, mediaType, platform) : combined;

        const payload = {
          live: true,
          page,
          totalPages: Math.max(hindiData?.total_pages || 1, globalData?.total_pages || 1),
          totalResults: (hindiData?.total_results || 0) + (globalData?.total_results || 0) || fallback.length,
          results: fallback
        };
        setCached(cacheKey, payload);
        return res.json(payload);
      } catch (e) {
        tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}&sort_by=popularity.desc&primary_release_date.gte=${past21Str}&primary_release_date.lte=${todayStr}`;
        explicitType = 'movie';
      }
    }
  }

  // If specific language or genre or specific discover category is requested, use discover
  if (genre || language || category === 'hindi' || category === 'korean' || category === 'south_indian' || category === 'anime' || category === 'action' || category === 'scifi' || category === 'comedy' || category === 'horror' || category === 'romance') {
    const genreId = GENRE_SLUG_TO_ID[genre.toLowerCase()] || 
      (category === 'action' ? 28 : category === 'scifi' ? 878 : category === 'anime' ? 16 : category === 'comedy' ? 35 : category === 'horror' ? 27 : category === 'romance' ? 10749 : undefined);
    
    let langCode = language || 
      (category === 'hindi' ? 'hi' : category === 'korean' ? 'ko' : category === 'south_indian' ? 'te|ta' : category === 'anime' ? 'ja' : '');

    let discoverParams = `api_key=${apiKey}&page=${page}&sort_by=popularity.desc`;
    if (genreId) discoverParams += `&with_genres=${genreId}`;
    if (langCode && langCode !== 'all') discoverParams += `&with_original_language=${langCode}`;

    tmdbUrl = `https://api.themoviedb.org/3/discover/${targetType}?${discoverParams}`;
  } else {
    switch (category) {
      case 'trending':
        tmdbUrl = `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=${page}`;
        explicitType = undefined;
        break;
      case 'new_releases': {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const past21 = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
        const past21Str = past21.toISOString().split('T')[0];
        tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}&primary_release_date.gte=${past21Str}&primary_release_date.lte=${todayStr}&sort_by=popularity.desc`;
        explicitType = 'movie';
        break;
      }
      case 'popular_movies':
      case 'movies':
        tmdbUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`;
        explicitType = 'movie';
        break;
      case 'popular_tv':
      case 'tv':
        tmdbUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&page=${page}`;
        explicitType = 'tv';
        break;
      case 'top_rated_movies':
        tmdbUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=${page}`;
        explicitType = 'movie';
        break;
      case 'top_rated_tv':
        tmdbUrl = `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&page=${page}`;
        explicitType = 'tv';
        break;
      case 'now_playing':
        tmdbUrl = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&page=${page}`;
        explicitType = 'movie';
        break;
      case 'on_the_air':
        tmdbUrl = `https://api.themoviedb.org/3/tv/on_the_air?api_key=${apiKey}&page=${page}`;
        explicitType = 'tv';
        break;
      default:
        tmdbUrl = `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=${page}`;
        explicitType = undefined;
    }
  }

  try {
    const response = await fetch(tmdbUrl);
    if (!response.ok) {
      const fallback = filterSampleMedia(category, genre, language, mediaType, platform);
      return res.json({
        live: false,
        page: 1,
        totalPages: 1,
        totalResults: fallback.length,
        results: fallback
      });
    }
    const data = await response.json();
    const formatted = (data.results || [])
      .filter((item: any) => item.poster_path) // ensure valid media with posters
      .map((item: any) => formatTmdbItem(item, explicitType));

    const fallbackIfEmpty = formatted.length === 0 ? filterSampleMedia(category, genre, language, mediaType, platform) : formatted;

    const payload = {
      live: true,
      page: data.page || page,
      totalPages: data.total_pages || 1,
      totalResults: data.total_results || fallbackIfEmpty.length,
      results: fallbackIfEmpty
    };

    setCached(cacheKey, payload);
    return res.json(payload);
  } catch (err: any) {
    const fallback = filterSampleMedia(category, genre, language, mediaType, platform);
    return res.json({
      live: false,
      page: 1,
      totalPages: 1,
      totalResults: fallback.length,
      results: fallback
    });
  }
});

// Live Multi-Search across millions of TMDB titles with pagination
app.get(['/api/tmdb/search', '/tmdb/search'], async (req: Request, res: Response) => {
  const apiKey = TMDB_API_KEY;
  const query = req.query.q as string;
  const page = parseInt(req.query.page as string) || 1;

  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  const fallbackSearch = () => {
    const q = query.toLowerCase();
    const matches = SAMPLE_MEDIA.filter(m => 
      m.title.toLowerCase().includes(q) || 
      (m.overview && m.overview.toLowerCase().includes(q))
    );
    return {
      live: false,
      page: 1,
      totalPages: 1,
      totalResults: matches.length,
      results: matches
    };
  };

  if (!apiKey) {
    return res.json(fallbackSearch());
  }

  const cacheKey = `search_${query.toLowerCase().trim()}_${page}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.json(fallbackSearch());
    }
    const data = await response.json();
    const formatted = (data.results || [])
      .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
      .map((item: any) => formatTmdbItem(item));

    const payload = {
      live: true,
      page: data.page || page,
      totalPages: data.total_pages || 1,
      totalResults: data.total_results || formatted.length,
      results: formatted.length > 0 ? formatted : fallbackSearch().results
    };

    setCached(cacheKey, payload);
    return res.json(payload);
  } catch (err: any) {
    return res.json(fallbackSearch());
  }
});

// Full Details endpoint (fetches external IDs, runtime, seasons count, recommendations, and season 1 episodes)
app.get(['/api/tmdb/details/:type/:id', '/tmdb/details/:type/:id'], async (req: Request, res: Response) => {
  const apiKey = TMDB_API_KEY;
  const { type, id } = req.params;

  const sampleFallback = () => {
    const sample = SAMPLE_MEDIA.find(m => m.id === parseInt(id));
    if (sample) return { live: false, data: sample };
    return null;
  };

  if (!apiKey) {
    const sample = sampleFallback();
    if (sample) return res.json(sample);
    return res.status(404).json({ error: 'Title not found' });
  }

  const cacheKey = `details_${type}_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const detailUrl = `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&append_to_response=external_ids,recommendations,credits`;
    const response = await fetch(detailUrl);
    if (!response.ok) {
      const sample = sampleFallback();
      if (sample) return res.json(sample);
      return res.status(404).json({ error: 'Title details not found' });
    }
    const raw = await response.json();
    const item = formatTmdbItem(raw, type as 'movie' | 'tv');
    
    // Inject IMDb ID
    item.imdbId = raw.external_ids?.imdb_id || item.imdbId;

    // If TV, fetch season 1 episodes
    if (type === 'tv') {
      try {
        const season1Res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/1?api_key=${apiKey}`);
        if (season1Res.ok) {
          const s1 = await season1Res.json();
          item.episodesList = (s1.episodes || []).map((ep: any) => ({
            season: 1,
            episode: ep.episode_number,
            title: ep.name || `Episode ${ep.episode_number}`,
            overview: ep.overview || '',
            still: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
            runtime: ep.runtime ? `${ep.runtime}m` : '45m'
          }));
          item.episodesPerSeason = item.episodesList.length;
        }
      } catch {
        // non-fatal
      }
    }

    // Recommendations
    if (raw.recommendations?.results) {
      item.recommendations = raw.recommendations.results
        .filter((r: any) => r.poster_path)
        .slice(0, 8)
        .map((r: any) => formatTmdbItem(r));
    }

    const payload = { live: true, data: item };
    setCached(cacheKey, payload);
    return res.json(payload);
  } catch (err: any) {
    const sample = sampleFallback();
    if (sample) return res.json(sample);
    return res.status(500).json({ error: err.message || 'Failed to fetch details' });
  }
});

// Season Episodes proxy
app.get(['/api/tmdb/tv/:id/season/:season', '/tmdb/tv/:id/season/:season'], async (req: Request, res: Response) => {
  const apiKey = TMDB_API_KEY;
  const { id, season } = req.params;

  const sampleMediaFallback = () => {
    const sMedia = SAMPLE_MEDIA.find(m => m.id === parseInt(id));
    if (sMedia && sMedia.episodesList) {
      const seasonNum = parseInt(season);
      const filtered = sMedia.episodesList.filter(e => e.season === seasonNum);
      if (filtered.length > 0) {
        return {
          live: false,
          season: seasonNum,
          episodes: filtered.map(ep => ({
            ...ep,
            still: ep.still || sMedia.backdrop || sMedia.poster,
            overview: ep.overview || `Follow the drama in Season ${seasonNum}, Episode ${ep.episode} of ${sMedia.title}.`
          }))
        };
      }
    }
    return null;
  };

  if (!apiKey) {
    const fb = sampleMediaFallback();
    if (fb) return res.json(fb);
    return res.status(200).json({ live: false, episodes: [] });
  }

  const cacheKey = `tv_season_${id}_${season}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${apiKey}`);
    if (!response.ok) {
      const fb = sampleMediaFallback();
      if (fb) return res.json(fb);
      return res.status(response.status).json({ error: 'Season not found on TMDB' });
    }
    const data = await response.json();
    const episodes = (data.episodes || []).map((ep: any) => ({
      season: parseInt(season),
      episode: ep.episode_number,
      title: ep.name || `Episode ${ep.episode_number}`,
      overview: ep.overview,
      still: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
      runtime: ep.runtime ? `${ep.runtime}m` : '45m'
    }));

    const payload = { live: true, season: parseInt(season), episodes };
    setCached(cacheKey, payload);
    return res.json(payload);
  } catch (err: any) {
    const fb = sampleMediaFallback();
    if (fb) return res.json(fb);
    return res.status(500).json({ error: err.message || 'Failed to fetch season' });
  }
});

// Automatic Open-Source Multi-Source Poster Resolver
// Fallback for missing/broken TMDB posters using Wikipedia, TVMaze, and iTunes APIs
const posterMemoryCache = new Map<string, string>();

app.get(['/api/poster/fallback', '/poster/fallback'], async (req: Request, res: Response) => {
  const rawTitle = (req.query.title as string || '').trim();
  const type = (req.query.type as string || 'movie').toLowerCase();
  const year = req.query.year as string;

  if (!rawTitle) {
    return res.status(400).json({ success: false, error: 'Title required' });
  }

  const cleanTitle = rawTitle.replace(/\(.*?\)/g, '').trim();
  const cacheKey = `${cleanTitle.toLowerCase()}_${type}_${year || ''}`;

  if (posterMemoryCache.has(cacheKey)) {
    return res.json({ success: true, posterUrl: posterMemoryCache.get(cacheKey), source: 'cache' });
  }

  // 1. If TV Show, query TVMaze API
  if (type === 'tv') {
    try {
      const tvMazeRes = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(cleanTitle)}`);
      if (tvMazeRes.ok) {
        const tvData: any = await tvMazeRes.json();
        const img = tvData.image?.original || tvData.image?.medium;
        if (img) {
          posterMemoryCache.set(cacheKey, img);
          return res.json({ success: true, posterUrl: img, source: 'tvmaze' });
        }
      }
    } catch {
      // Continue to next fallback
    }
  }

  // 2. Query Wikipedia Search & Page Summary (Free, high-res official theatrical posters)
  try {
    const searchParam = cleanTitle + (year ? ` ${year}` : '') + (type === 'tv' ? ' TV series' : ' film');
    const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchParam)}&format=json&srlimit=1`;
    const wikiSearchRes = await fetch(wikiSearchUrl, { headers: { 'User-Agent': 'AnshFlix/1.0 (media-poster-bot)' } });
    
    if (wikiSearchRes.ok) {
      const searchData: any = await wikiSearchRes.json();
      const topPageTitle = searchData.query?.search?.[0]?.title;
      if (topPageTitle) {
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topPageTitle)}`;
        const summaryRes = await fetch(summaryUrl, { headers: { 'User-Agent': 'AnshFlix/1.0 (media-poster-bot)' } });
        if (summaryRes.ok) {
          const sumData: any = await summaryRes.json();
          const poster = sumData.thumbnail?.source || sumData.originalimage?.source;
          if (poster && !poster.endsWith('.svg')) {
            posterMemoryCache.set(cacheKey, poster);
            return res.json({ success: true, posterUrl: poster, source: 'wikipedia' });
          }
        }
      }
    }
  } catch {
    // Continue to iTunes
  }

  // 3. Query iTunes Store Search API (High resolution 600x600 artwork)
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&entity=${type === 'tv' ? 'tvSeason' : 'movie'}&limit=1`;
    const itunesRes = await fetch(itunesUrl);
    if (itunesRes.ok) {
      const itunesData: any = await itunesRes.json();
      if (itunesData.results?.[0]?.artworkUrl100) {
        const highRes = itunesData.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
        posterMemoryCache.set(cacheKey, highRes);
        return res.json({ success: true, posterUrl: highRes, source: 'itunes' });
      }
    }
  } catch {
    // End of external providers
  }

  return res.json({ success: false, error: 'No poster found from open sources' });
});

// ============================================================================
// SIMPLE EMAIL OTP + 4-DIGIT PIN AUTHENTICATION & USER DATA PERSISTENCE
// ============================================================================

interface StoredUser {
  email: string;
  pin: string; // 4-digit numeric string
  registeredAt: number;
  preferences: {
    autoPlay: boolean;
    defaultServerId: string;
    preferredLanguage?: string;
    subtitlesEnabled?: boolean;
  };
  continueWatching: Array<{
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
  }>;
  watchlist: number[];
}

const USERS_FILE = path.join(process.cwd(), 'users_store.json');
const usersDb = new Map<string, StoredUser>();

// In-memory OTP storage: email -> { otp, expiresAt, verified }
const otpStore = new Map<string, { otp: string; expiresAt: number; verified: boolean }>();

// Load users from disk
function loadUsersFromDisk() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      const data: Record<string, StoredUser> = JSON.parse(raw);
      for (const [email, user] of Object.entries(data)) {
        usersDb.set(email.toLowerCase(), user);
      }
      console.log(`Loaded ${usersDb.size} registered users from disk`);
    }
  } catch (err) {
    console.error('Failed to load users from disk:', err);
  }
}

// Save users to disk
function saveUsersToDisk() {
  try {
    const data: Record<string, StoredUser> = {};
    for (const [email, user] of usersDb.entries()) {
      data[email] = user;
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save users to disk:', err);
  }
}

loadUsersFromDisk();

function sanitizeUser(user: StoredUser) {
  return {
    email: user.email,
    hasPin: true,
    registeredAt: user.registeredAt,
    preferences: user.preferences || {
      autoPlay: true,
      defaultServerId: 'vidlink',
      preferredLanguage: 'hi',
      subtitlesEnabled: true
    },
    continueWatching: user.continueWatching || [],
    watchlist: user.watchlist || []
  };
}

function getEmailTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser.trim(),
        pass: gmailPass.trim(),
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 6000,
      dnsTimeout: 5000,
    });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost.trim(),
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser.trim(),
        pass: smtpPass.trim(),
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 6000,
      dnsTimeout: 5000,
    });
  }

  return null;
}

async function sendOtpEmail(toEmail: string, otpCode: string): Promise<{ sent: boolean; error?: string; provider?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; background-color: #070b14; color: #f1f5f9; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #f43f5e; font-size: 26px; font-weight: 800; margin: 0;">Ansh's Flix v2</h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">Streaming & Cinema Experience</p>
      </div>
      <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 16px 0;">Your 6-digit verification code is:</p>
        <div style="display: inline-block; background-color: #070b14; border: 2px solid #f43f5e; border-radius: 12px; padding: 12px 28px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #ffffff; font-family: monospace;">
          ${otpCode}
        </div>
        <p style="color: #64748b; font-size: 12px; margin: 16px 0 0 0;">This code will expire in 10 minutes.</p>
      </div>
      <div style="border-top: 1px solid #1e293b; padding-top: 16px; text-align: center;">
        <p style="color: #64748b; font-size: 11px; margin: 0;">If you did not request this verification code, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  // 1. Try Brevo (Sendinblue) HTTP API (Sends to ANY email address, 300 free/day, never blocked by Render)
  if (brevoApiKey) {
    try {
      const senderEmail = process.env.EMAIL_FROM || process.env.GMAIL_USER || 'no-reply@anshsflix.com';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey.trim(),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: "Ansh's Flix", email: senderEmail },
          to: [{ email: toEmail }],
          subject: `Your Ansh's Flix Verification Code: ${otpCode}`,
          htmlContent: emailHtml
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        console.log(`[AUTH] Sent email via Brevo to ${toEmail}`);
        return { sent: true, provider: 'brevo' };
      } else {
        const brevoErr = await res.json().catch(() => ({ message: res.statusText }));
        console.warn('[AUTH] Brevo API error response:', res.status, brevoErr);
      }
    } catch (err: any) {
      console.warn('[AUTH] Brevo delivery failed or timed out:', err?.message);
    }
  }

  // 2. Try Resend HTTP REST API
  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `Ansh's Flix <${fromEmail}>`,
          to: [toEmail],
          subject: `Your Ansh's Flix Verification Code: ${otpCode}`,
          html: emailHtml
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        console.log(`[AUTH] Sent email via Resend to ${toEmail}`);
        return { sent: true, provider: 'resend' };
      } else {
        const resendErr = await res.json().catch(() => ({ message: res.statusText }));
        console.warn('[AUTH] Resend API error response:', res.status, resendErr);
      }
    } catch (err: any) {
      console.warn('[AUTH] Resend delivery failed or timed out:', err?.message);
    }
  }

  // 3. Try SendGrid HTTP API
  if (sendgridApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || 'no-reply@anshsflix.com';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: toEmail }] }],
          from: { email: fromEmail, name: "Ansh's Flix" },
          subject: `Your Ansh's Flix Verification Code: ${otpCode}`,
          content: [{ type: 'text/html', value: emailHtml }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (res.ok || res.status === 202) {
        console.log(`[AUTH] Sent email via SendGrid to ${toEmail}`);
        return { sent: true, provider: 'sendgrid' };
      }
    } catch (err: any) {
      console.warn('[AUTH] SendGrid delivery failed or timed out:', err?.message);
    }
  }

  // 4. Try Nodemailer (Gmail App Password or custom SMTP) with hard timeout
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      return {
        sent: false,
        error: 'Email transporter not configured. Please add GMAIL_USER & GMAIL_APP_PASSWORD in Render Environment.'
      };
    }

    const fromAddress = process.env.EMAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER;
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; background-color: #070b14; color: #f1f5f9; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #f43f5e; font-size: 26px; font-weight: 800; margin: 0;">Ansh's Flix v2</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">Streaming & Cinema Experience</p>
        </div>
        <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 16px 0;">Your 6-digit verification code is:</p>
          <div style="display: inline-block; background-color: #070b14; border: 2px solid #f43f5e; border-radius: 12px; padding: 12px 28px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #ffffff; font-family: monospace;">
            ${otpCode}
          </div>
          <p style="color: #64748b; font-size: 12px; margin: 16px 0 0 0;">This code will expire in 10 minutes.</p>
        </div>
      </div>
    `;

    // Strict 6-second timeout race to prevent server hanging
    await Promise.race([
      transporter.sendMail({
        from: `"Ansh's Flix" <${fromAddress}>`,
        to: toEmail,
        subject: `Your Ansh's Flix Verification Code: ${otpCode}`,
        text: `Your verification code is: ${otpCode}. It expires in 10 minutes.`,
        html: htmlContent,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP connection timed out after 6 seconds')), 6000))
    ]);

    console.log(`[AUTH] Sent real verification email via Nodemailer to ${toEmail}`);
    return { sent: true, provider: 'smtp' };
  } catch (err: any) {
    console.error('[AUTH] Email sending failed or timed out:', err?.message);
    return { sent: false, error: err?.message || 'Failed to deliver email' };
  }
}

// Diagnostic endpoint to check which email variables are detected on Render
app.get('/api/auth/debug-email', (req: Request, res: Response) => {
  const resendKey = process.env.RESEND_API_KEY;
  const brevoKey = process.env.BREVO_API_KEY;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  return res.json({
    hasResendApiKey: !!resendKey,
    resendKeyPrefix: resendKey ? `${resendKey.substring(0, 5)}...` : 'NONE',
    hasBrevoApiKey: !!brevoKey,
    hasSendgridApiKey: !!sendgridKey,
    hasGmailUser: !!gmailUser,
    gmailUser: gmailUser ? `${gmailUser.substring(0, 3)}***@...` : 'NONE',
    hasGmailAppPassword: !!gmailPass,
    emailFrom: process.env.EMAIL_FROM || 'NOT_SET',
    renderSmtpNotice: 'Render free tier blocks SMTP ports 465/587 (Gmail). Use RESEND_API_KEY or BREVO_API_KEY (HTTPS REST API) for 100% successful delivery.'
  });
});

// 1. Send OTP to email (Guaranteed non-blocking & fast)
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
  }

  const cleanEmail = email.trim().toLowerCase();
  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 1000 * 60 * 10; // 10 minutes expiry

  otpStore.set(cleanEmail, { otp, expiresAt, verified: false });

  const isRegistered = usersDb.has(cleanEmail);
  console.log(`[AUTH] Generated OTP for ${cleanEmail}: ${otp} (isRegistered: ${isRegistered})`);

  // Try real email sending with strict timeout
  const emailResult = await sendOtpEmail(cleanEmail, otp);

  // Return success even if email service is not configured / blocked on Render,
  // supplying the OTP as instant fallback so user is NEVER stuck in a loading loop!
  return res.json({
    success: true,
    sentViaEmail: emailResult.sent,
    provider: emailResult.provider || 'demo',
    demoOtp: emailResult.sent ? undefined : otp,
    message: emailResult.sent 
      ? `Verification code sent to ${cleanEmail}. Please check your inbox and spam.`
      : `Email service is unconfigured on Render. Instant Verification Code: ${otp}`,
    isRegistered
  });
});

// 2. Verify OTP
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP code are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const record = otpStore.get(cleanEmail);

  if (!record) {
    return res.status(400).json({ success: false, error: 'No OTP requested for this email or it has expired' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new code.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ success: false, error: 'Incorrect verification code. Please check and try again.' });
  }

  record.verified = true;
  const isRegistered = usersDb.has(cleanEmail);

  return res.json({
    success: true,
    message: 'OTP verified successfully',
    isRegistered
  });
});

// 3. Set 4-digit PIN & Register / Reset PIN
app.post('/api/auth/set-pin', (req: Request, res: Response) => {
  const { email, otp, pin } = req.body;
  if (!email || !pin) {
    return res.status(400).json({ success: false, error: 'Email and 4-digit PIN are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPin = String(pin).trim();

  if (!/^\d{4}$/.test(cleanPin)) {
    return res.status(400).json({ success: false, error: 'PIN must be exactly 4 numeric digits (0-9)' });
  }

  // Verify OTP was passed or verified
  const record = otpStore.get(cleanEmail);
  const isOtpValid = (record && record.verified) || (record && record.otp === String(otp).trim());
  if (!isOtpValid) {
    return res.status(400).json({ success: false, error: 'Invalid or unverified OTP session. Please verify OTP first.' });
  }

  let user = usersDb.get(cleanEmail);
  if (!user) {
    user = {
      email: cleanEmail,
      pin: cleanPin,
      registeredAt: Date.now(),
      preferences: {
        autoPlay: true,
        defaultServerId: 'vidlink',
        preferredLanguage: 'hi',
        subtitlesEnabled: true
      },
      continueWatching: [],
      watchlist: []
    };
  } else {
    user.pin = cleanPin;
  }

  usersDb.set(cleanEmail, user);
  saveUsersToDisk();
  otpStore.delete(cleanEmail);

  return res.json({
    success: true,
    message: '4-digit PIN configured successfully',
    user: sanitizeUser(user)
  });
});

// 4. Fast Login with 4-Digit PIN
app.post('/api/auth/login-pin', (req: Request, res: Response) => {
  const { email, pin } = req.body;
  if (!email || !pin) {
    return res.status(400).json({ success: false, error: 'Email and PIN are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPin = String(pin).trim();

  const user = usersDb.get(cleanEmail);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Account not found. Please register with your email and OTP.'
    });
  }

  if (user.pin !== cleanPin) {
    return res.status(401).json({
      success: false,
      error: 'Incorrect 4-digit PIN. Please try again or reset via OTP.'
    });
  }

  return res.json({
    success: true,
    message: 'Login successful',
    user: sanitizeUser(user)
  });
});

// 4b. Check if user exists & has PIN
app.post('/api/auth/check-user', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = usersDb.get(cleanEmail);
  return res.json({
    success: true,
    exists: !!user,
    hasPin: !!(user && user.pin)
  });
});

// 5. User Data Sync (Preferences, Continue Watching, Watchlist)
app.post('/api/user/sync', (req: Request, res: Response) => {
  const { email, preferences, continueWatching, watchlist } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = usersDb.get(cleanEmail);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences };
  }
  if (Array.isArray(continueWatching)) {
    user.continueWatching = continueWatching.slice(0, 30);
  }
  if (Array.isArray(watchlist)) {
    user.watchlist = watchlist;
  }

  usersDb.set(cleanEmail, user);
  saveUsersToDisk();

  return res.json({
    success: true,
    user: sanitizeUser(user)
  });
});

// 6. Get User Profile
app.get('/api/user/profile', (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email query parameter is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = usersDb.get(cleanEmail);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  return res.json({
    success: true,
    user: sanitizeUser(user)
  });
});

// ============================================================================
// LIGHTWEIGHT HEALTH & CRON KEEPALIVE ENDPOINTS (Saves Render Free Tier Bandwidth)
// ============================================================================
// Cron jobs (e.g. UptimeRobot, cron-job.org) can hit:
// https://ansh-flix-v2.onrender.com/health OR /ping OR /status
// Returns an immediate 2-byte/minimal response without loading HTML, CSS, or TMDB.
app.all(['/health', '/api/health', '/ping', '/api/ping', '/status', '/api/status'], (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('X-Render-Keepalive', 'ok');

  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  if (req.query.format === 'text' || req.headers.accept?.includes('text/plain')) {
    return res.status(200).type('text/plain').send('OK');
  }

  return res.status(200).json({
    status: 'ok',
    service: 'Ansh Flix v2',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Always return JSON 404 for unhandled API requests (prevents SPA HTML fallback for API calls)
app.all(['/api/*', '/api'], (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const assetsPath = path.join(distPath, 'assets');

    // 1. Aggressive 1-year immutable caching for Vite build assets (JS/CSS with unique content hashes)
    if (fs.existsSync(assetsPath)) {
      app.use('/assets', express.static(assetsPath, {
        maxAge: '1y',
        immutable: true,
        etag: true,
        lastModified: true
      }));
    }

    // 2. 7-day caching for images, fonts, icons, svgs, and static resources
    app.use(express.static(distPath, {
      maxAge: '7d',
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          // Never cache HTML so new code updates and releases take effect immediately
          res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        } else if (filePath.match(/\.(svg|png|jpg|jpeg|webp|ico|woff2|woff|ttf)$/i)) {
          res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=2592000');
        }
      }
    }));

    // 3. Fallback for SPA routing
    app.get('*', (req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ansh's Flix v2 multi-server streaming running on http://localhost:${PORT}`);
  });
}

// In Vercel serverless environment, Vercel wraps the exported app handler
if (!process.env.VERCEL) {
  start();
}

export default app;
