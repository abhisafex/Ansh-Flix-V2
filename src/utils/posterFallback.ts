// Open-source Poster Fallback Engine
// Automatically fetches posters from Wikipedia API, TVMaze API, and iTunes Search API
// when TMDB posters are missing or return 404.

const CACHE_KEY = 'ansh_poster_fallback_cache_v1';

// In-memory cache for instant lookups during session
const memoryCache = new Map<string, string>();

// Seed with well-known open-source high-res posters from Wikimedia / TVMaze
const STATIC_FALLBACKS: Record<string, string> = {
  'stree 2': 'https://upload.wikimedia.org/wikipedia/en/a/a1/Stree_2.jpg',
  '12th fail': 'https://upload.wikimedia.org/wikipedia/en/f/f2/12th_Fail_poster.jpeg',
  'animal': 'https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg',
  'kalki 2898 ad': 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg',
  'jawan': 'https://upload.wikimedia.org/wikipedia/en/3/39/Jawan_film_poster.jpg',
  'panchayat': 'https://static.tvmaze.com/uploads/images/original_untouched/517/1293627.jpg',
  'mirzapur': 'https://static.tvmaze.com/uploads/images/original_untouched/619/1549499.jpg',
  'squid game': 'https://static.tvmaze.com/uploads/images/original_untouched/576/1440521.jpg',
  'the runner': 'https://upload.wikimedia.org/wikipedia/en/8/87/The_Runner_%282015_film%29.png',
};

// Initialize cache from localStorage
try {
  const stored = localStorage.getItem(CACHE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    Object.entries(parsed).forEach(([k, v]) => {
      if (typeof v === 'string') memoryCache.set(k.toLowerCase(), v);
    });
  }
} catch (e) {
  // Local storage not accessible (iframe sandbox / private window)
}

function saveToStorage() {
  try {
    const obj: Record<string, string> = {};
    memoryCache.forEach((v, k) => { obj[k] = v; });
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch (e) {
    // Ignore storage quota errors
  }
}

/**
 * Normalizes title for consistent cache keys
 */
export function normalizeTitleKey(title: string): string {
  return title.trim().toLowerCase().replace(/[:\-_/\\#]/g, ' ').replace(/\s+/g, ' ');
}

/**
 * Checks if a poster is already cached
 */
export function getCachedPoster(title: string): string | null {
  const norm = normalizeTitleKey(title);
  if (STATIC_FALLBACKS[norm]) return STATIC_FALLBACKS[norm];
  return memoryCache.get(norm) || null;
}

/**
 * Direct client-side fetch from Wikipedia REST API / TVMaze
 * Runs automatically if TMDB or backend endpoint fails
 */
export async function fetchPosterFromOpenSource(
  title: string,
  type: 'movie' | 'tv' = 'movie',
  year?: number | string
): Promise<string | null> {
  const normKey = normalizeTitleKey(title);

  // Check memory & static cache first
  const cached = getCachedPoster(title);
  if (cached) return cached;

  const cleanTitle = title.replace(/\(.*?\)/g, '').trim();

  // 1. If TV Show, TVMaze is fast, free and dedicated to series
  if (type === 'tv') {
    try {
      const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(cleanTitle)}`);
      if (res.ok) {
        const data = await res.json();
        const img = data.image?.original || data.image?.medium;
        if (img) {
          memoryCache.set(normKey, img);
          saveToStorage();
          return img;
        }
      }
    } catch {
      // Fall through to Wikipedia
    }
  }

  // 2. Try Backend API first (/api/poster/fallback)
  try {
    const params = new URLSearchParams({
      title: cleanTitle,
      type,
      ...(year ? { year: String(year) } : {})
    });
    const res = await fetch(`/api/poster/fallback?${params.toString()}`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.posterUrl) {
        memoryCache.set(normKey, data.posterUrl);
        saveToStorage();
        return data.posterUrl;
      }
    }
  } catch {
    // Fall back to direct Wikipedia API
  }

  // 3. Direct Wikipedia Search & Page Summary
  try {
    // A. First try search query to find the exact article title
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanTitle + (type === 'tv' ? ' TV series' : ' film'))}&format=json&origin=*&srlimit=1`;
    const searchRes = await fetch(searchUrl);
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const topHit = searchData.query?.search?.[0]?.title;
      if (topHit) {
        // Fetch summary of that top hit
        const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topHit)}`);
        if (summaryRes.ok) {
          const sumData = await summaryRes.json();
          const poster = sumData.thumbnail?.source || sumData.originalimage?.source;
          if (poster && !poster.endsWith('.svg')) {
            memoryCache.set(normKey, poster);
            saveToStorage();
            return poster;
          }
        }
      }
    }
  } catch {
    // Fall through to iTunes
  }

  // 4. iTunes Search API (Free, high-res 600x600)
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&media=${type === 'tv' ? 'tvShow' : 'movie'}&limit=1`;
    const itunesRes = await fetch(itunesUrl);
    if (itunesRes.ok) {
      const itunesData = await itunesRes.json();
      if (itunesData.results?.[0]?.artworkUrl100) {
        const highRes = itunesData.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
        memoryCache.set(normKey, highRes);
        saveToStorage();
        return highRes;
      }
    }
  } catch {
    // Return null
  }

  return null;
}
