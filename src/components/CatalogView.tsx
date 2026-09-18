import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Star, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Film, 
  Tv, 
  Bookmark, 
  Zap, 
  Search, 
  Filter, 
  Server, 
  Globe, 
  Info, 
  CheckCircle2, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Clapperboard, 
  X,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Menu,
  SlidersHorizontal
} from 'lucide-react';
import { MediaItem } from '../types';
import { SAMPLE_MEDIA } from '../data/sampleMedia';
import { MediaCard } from './MediaCard';
import { SmartPoster } from './SmartPoster';
import { useAuth } from '../context/AuthContext';

export interface CatalogViewProps {
  onSelectMedia: (item: MediaItem) => void;
  tmdbLiveConfigured?: boolean;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  selectedGenre?: string;
  onGenreChange?: (genre: string) => void;
  selectedLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  selectedType?: string;
  onTypeChange?: (type: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenMobileDrawer?: () => void;
}

export interface CategoryOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'trending', name: 'Home / Trending', icon: <Flame className="w-3.5 h-3.5 text-rose-400" />, description: 'Top trending movies & shows worldwide today' },
  { id: 'new_releases', name: 'New Releases', icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />, description: 'Latest movies released in the last 21 days' },
  { id: 'popular_movies', name: 'Movies', icon: <Film className="w-3.5 h-3.5 text-sky-400" />, description: 'Most watched movies right now' },
  { id: 'popular_tv', name: 'TV Shows', icon: <Tv className="w-3.5 h-3.5 text-purple-400" />, description: 'Hit television and streaming series' },
  { id: 'hindi', name: 'Bollywood', icon: <Globe className="w-3.5 h-3.5 text-rose-500" />, description: 'Blockbuster Bollywood cinema & movies' },
  { id: 'korean', name: 'K-Drama & Korean', icon: <Sparkles className="w-3.5 h-3.5 text-pink-400" />, description: 'Hit Korean dramas & Asian cinema' },
  { id: 'anime', name: 'Anime', icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />, description: 'Top Japanese anime series and films' },
  { id: 'top_rated_movies', name: '4K Content', icon: <Star className="w-3.5 h-3.5 text-amber-400" />, description: 'Highest rated cinema of all time in 4K' },
  { id: 'action', name: 'Action', icon: <TrendingUp className="w-3.5 h-3.5 text-orange-400" />, description: 'High-octane action blockbusters' },
  { id: 'now_playing', name: 'In Theaters', icon: <Clapperboard className="w-3.5 h-3.5 text-emerald-400" />, description: 'Recent theatrical and streaming releases' },
  { id: 'watchlist', name: 'Watchlist', icon: <Bookmark className="w-3.5 h-3.5 text-amber-400" />, description: 'Titles you have bookmarked' },
];

export const GENRE_OPTIONS = [
  { id: 'all', label: 'All Genres', emoji: '🎬' },
  { id: 'action', label: 'Action', emoji: '💥' },
  { id: 'comedy', label: 'Comedy', emoji: '🍿' },
  { id: 'horror', label: 'Horror', emoji: '👻' },
  { id: 'romance', label: 'Romance', emoji: '💖' },
  { id: 'scifi', label: 'Sci-Fi', emoji: '🚀' },
  { id: 'thriller', label: 'Thriller', emoji: '⚡' },
  { id: 'drama', label: 'Drama', emoji: '🎭' },
  { id: 'animation', label: 'Animation', emoji: '🎨' },
  { id: 'crime', label: 'Crime', emoji: '🕵️' },
  { id: 'adventure', label: 'Adventure', emoji: '🗺️' },
  { id: 'mystery', label: 'Mystery', emoji: '🔍' },
];

export const LANGUAGE_OPTIONS = [
  { id: 'all', label: 'All Languages', flag: '🌐' },
  { id: 'hi', label: 'Bollywood', flag: '🇮🇳' },
  { id: 'en', label: 'English (Hollywood)', flag: '🇺🇸' },
  { id: 'ko', label: 'Korean (K-Drama)', flag: '🇰🇷' },
  { id: 'ja', label: 'Japanese (Anime)', flag: '🇯🇵' },
  { id: 'te', label: 'Telugu (Tollywood)', flag: '🇮🇳' },
  { id: 'ta', label: 'Tamil (Kollywood)', flag: '🇮🇳' },
  { id: 'es', label: 'Spanish', flag: '🇪🇸' },
  { id: 'fr', label: 'French', flag: '🇫🇷' },
  { id: 'pa', label: 'Punjabi', flag: '🇮🇳' },
];

export const CatalogView: React.FC<CatalogViewProps> = ({
  onSelectMedia,
  tmdbLiveConfigured = true,
  activeCategory = 'trending',
  onCategoryChange,
  selectedGenre: propGenre,
  onGenreChange,
  selectedLanguage: propLang,
  onLanguageChange,
  selectedType: propType,
  onTypeChange,
  searchQuery: propSearchQuery,
  onSearchChange,
  onOpenMobileDrawer
}) => {
  const { user } = useAuth();
  const continueWatchingList = user?.continueWatching || [];
  const selectedCategory = activeCategory;
  const [internalGenre, setInternalGenre] = useState<string>('all');
  const [internalLanguage, setInternalLanguage] = useState<string>('all');
  const [internalType, setInternalType] = useState<string>('all');
  const [internalSearchQuery, setInternalSearchQuery] = useState<string>('');

  const selectedGenre = propGenre !== undefined ? propGenre : internalGenre;
  const setSelectedGenre = (val: string) => {
    setInternalGenre(val);
    if (onGenreChange) onGenreChange(val);
  };

  const selectedLanguage = propLang !== undefined ? propLang : internalLanguage;
  const setSelectedLanguage = (val: string) => {
    setInternalLanguage(val);
    if (onLanguageChange) onLanguageChange(val);
  };

  const selectedType = propType !== undefined ? propType : internalType;
  const setSelectedType = (val: string) => {
    setInternalType(val);
    if (onTypeChange) onTypeChange(val);
  };

  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : internalSearchQuery;
  const setSearchQuery = (val: string) => {
    setInternalSearchQuery(val);
    if (onSearchChange) onSearchChange(val);
  };

  const [activeSearch, setActiveSearch] = useState<string>(searchQuery);
  
  // Dynamic Catalog State
  const [items, setItems] = useState<MediaItem[]>(SAMPLE_MEDIA);
  const [spotlightItems, setSpotlightItems] = useState<MediaItem[]>(SAMPLE_MEDIA.slice(0, 5));
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(SAMPLE_MEDIA.length);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isLiveTMDB, setIsLiveTMDB] = useState<boolean>(false);

  // Local storage state
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [newReleasesShelf, setNewReleasesShelf] = useState<MediaItem[]>([]);

  // Search debounce timer
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Spotlight hero rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % (spotlightItems.length || 1));
    }, 9000);
    return () => clearInterval(timer);
  }, [spotlightItems.length]);

  // Load Watchlist and History from LocalStorage, and fetch New Releases shelf
  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem('autostream_watchlist');
      if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));

      const savedHistory = localStorage.getItem('autostream_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch {
      // ignore
    }

    // Fetch initial New Releases (last 21 days) for home screen shelf
    fetch('/api/tmdb/catalog?category=new_releases&page=1')
      .then(res => res.json())
      .then(data => {
        if (data && data.results && data.results.length > 0) {
          setNewReleasesShelf(data.results.slice(0, 12));
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleBookmark = (item: MediaItem) => {
    let updated: number[];
    if (watchlist.includes(item.id)) {
      updated = watchlist.filter(id => id !== item.id);
    } else {
      updated = [...watchlist, item.id];
    }
    setWatchlist(updated);
    try {
      localStorage.setItem('autostream_watchlist', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Local sample media multi-criteria filtering helper
  const filterLocalMedia = (cat: string, genre?: string, lang?: string, type?: string): MediaItem[] => {
    let filtered = [...SAMPLE_MEDIA];

    if (type === 'movie') filtered = filtered.filter(m => m.type === 'movie');
    else if (type === 'tv') filtered = filtered.filter(m => m.type === 'tv');

    if (cat === 'movies' || cat === 'popular_movies') filtered = filtered.filter(m => m.type === 'movie');
    else if (cat === 'tv' || cat === 'popular_tv') filtered = filtered.filter(m => m.type === 'tv');
    else if (cat === 'anime') filtered = filtered.filter(m => m.genres?.includes('Animation') || m.originalLanguage === 'ja');
    else if (cat === 'scifi') filtered = filtered.filter(m => m.genres?.includes('Sci-Fi'));
    else if (cat === 'hindi') filtered = filtered.filter(m => m.originalLanguage === 'hi' || m.language === 'Hindi');
    else if (cat === 'korean') filtered = filtered.filter(m => m.originalLanguage === 'ko' || m.language === 'Korean');
    else if (cat === 'south_indian') filtered = filtered.filter(m => m.originalLanguage === 'te' || m.originalLanguage === 'ta' || m.language === 'Telugu' || m.language === 'Tamil');
    else if (cat === 'action') filtered = filtered.filter(m => m.genres?.includes('Action'));
    else if (cat === 'comedy') filtered = filtered.filter(m => m.genres?.includes('Comedy'));
    else if (cat === 'horror') filtered = filtered.filter(m => m.genres?.includes('Horror'));
    else if (cat === 'romance') filtered = filtered.filter(m => m.genres?.includes('Romance'));
    else if (cat === 'new_releases') {
      filtered = filtered.filter(m => m.type === 'movie' && (m.year >= 2024 || m.featured));
      filtered.sort((a, b) => {
        const aBol = a.originalLanguage === 'hi' || a.language === 'Hindi' || a.genres?.includes('Bollywood') ? 1 : 0;
        const bBol = b.originalLanguage === 'hi' || b.language === 'Hindi' || b.genres?.includes('Bollywood') ? 1 : 0;
        return bBol - aBol;
      });
    }
    else if (cat === 'top_rated_movies' || cat === '4k') filtered = filtered.filter(m => (m.rating || 0) >= 7.8);

    if (genre && genre !== 'all') {
      const gLower = genre.toLowerCase();
      filtered = filtered.filter(m => m.genres?.some(g => g.toLowerCase().includes(gLower)));
    }

    if (lang && lang !== 'all') {
      const lLower = lang.toLowerCase();
      filtered = filtered.filter(m => 
        (m.originalLanguage && m.originalLanguage.toLowerCase() === lLower) ||
        (m.language && m.language.toLowerCase().includes(lLower))
      );
    }

    return filtered;
  };

  // Fetch titles from backend API with genre, language, type, category support
  const fetchCatalog = async (
    cat: string, 
    genre: string, 
    lang: string, 
    type: string, 
    targetPage: number, 
    append: boolean = false
  ) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      // If user selected Watchlist, load from local list + sample
      if (cat === 'watchlist') {
        const savedIds = watchlist;
        const watchItems = SAMPLE_MEDIA.filter(m => savedIds.includes(m.id));
        setItems(watchItems);
        setTotalPages(1);
        setTotalResults(watchItems.length);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      const params = new URLSearchParams();
      params.append('category', cat);
      if (genre && genre !== 'all') params.append('genre', genre);
      if (lang && lang !== 'all') params.append('language', lang);
      if (type && type !== 'all') params.append('type', type);
      params.append('page', targetPage.toString());

      let data: any = null;
      let receivedHtml = false;

      try {
        const res = await fetch(`/api/tmdb/catalog?${params.toString()}`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          data = await res.json();
        } else if (contentType.includes('text/html')) {
          receivedHtml = true;
        }
      } catch {
        // Network or fetch failure handled smoothly
      }

      if (data && data.results && data.results.length > 0) {
        setIsLiveTMDB(Boolean(data.live));
        setTotalPages(Math.min(data.totalPages || 500, 500));
        setTotalResults(data.totalResults || 10000);
        setPage(targetPage);

        if (append) {
          setItems(prev => {
            const existingIds = new Set(prev.map(i => `${i.id}-${i.type}`));
            const newItems = data.results.filter((i: MediaItem) => !existingIds.has(`${i.id}-${i.type}`));
            return [...prev, ...newItems];
          });
        } else {
          // Prioritize Bollywood movies in New Releases if present
          const processedResults = (cat === 'new_releases' && (!lang || lang === 'all'))
            ? [...data.results].sort((a: MediaItem, b: MediaItem) => {
                const aBol = a.originalLanguage === 'hi' || a.language === 'Hindi' || a.genres?.includes('Bollywood') ? 1 : 0;
                const bBol = b.originalLanguage === 'hi' || b.language === 'Hindi' || b.genres?.includes('Bollywood') ? 1 : 0;
                return bBol - aBol;
              })
            : data.results;
          setItems(processedResults);
          // Set spotlight items from top rated with backdrops
          const topWithBackdrops = processedResults.filter((m: MediaItem) => m.backdrop && m.backdrop.length > 5);
          if (topWithBackdrops.length >= 3) {
            setSpotlightItems(topWithBackdrops.slice(0, 5));
          }
        }
      } else {
        // Resilient fallback to local media without parsing HTML as JSON
        const fallbackResults = filterLocalMedia(cat, genre, lang, type);
        setIsLiveTMDB(false);
        setTotalPages(1);
        setTotalResults(fallbackResults.length);
        setPage(1);

        if (!append) {
          setItems(fallbackResults);
          const topWithBackdrops = fallbackResults.filter((m: MediaItem) => m.backdrop && m.backdrop.length > 5);
          if (topWithBackdrops.length >= 3) {
            setSpotlightItems(topWithBackdrops.slice(0, 5));
          }
        }

        // If backend was temporarily warming up (received HTML warmup page), retry after short delay
        if (receivedHtml && !append && targetPage === 1) {
          setTimeout(() => {
            fetchCatalog(cat, genre, lang, type, 1, false);
          }, 1500);
        }
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Fetch search results from backend API
  const fetchSearch = async (query: string, targetPage: number, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      let data: any = null;
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}&page=${targetPage}`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          data = await res.json();
        }
      } catch {
        // Handled below
      }

      if (data && data.results) {
        setIsLiveTMDB(Boolean(data.live));
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.totalResults || data.results.length);
        setPage(targetPage);

        if (append) {
          setItems(prev => {
            const existingIds = new Set(prev.map(i => `${i.id}-${i.type}`));
            const newItems = data.results.filter((i: MediaItem) => !existingIds.has(`${i.id}-${i.type}`));
            return [...prev, ...newItems];
          });
        } else {
          setItems(data.results);
          if (data.results.length > 0) {
            setSpotlightItems(data.results.slice(0, 5));
            setHeroIndex(0);
          }
        }
      } else {
        // Fallback local search
        const q = query.toLowerCase();
        const matches = SAMPLE_MEDIA.filter(m => 
          m.title.toLowerCase().includes(q) || 
          (m.overview && m.overview.toLowerCase().includes(q))
        );
        setIsLiveTMDB(false);
        setTotalPages(1);
        setTotalResults(matches.length);
        setPage(1);
        if (!append) {
          setItems(matches);
          if (matches.length > 0) {
            setSpotlightItems(matches.slice(0, 5));
            setHeroIndex(0);
          }
        }
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Trigger catalog fetch whenever category, genre, language, or type changes
  useEffect(() => {
    if (activeSearch.trim() === '') {
      fetchCatalog(selectedCategory, selectedGenre, selectedLanguage, selectedType, 1, false);
    }
  }, [selectedCategory, selectedGenre, selectedLanguage, selectedType, activeSearch]);

  // Handle Search Input Change with Debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setActiveSearch(val);
      if (val.trim() !== '') {
        fetchSearch(val.trim(), 1, false);
      }
    }, 400);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    fetchCatalog(selectedCategory, selectedGenre, selectedLanguage, selectedType, 1, false);
  };

  const handleResetFilters = () => {
    setSelectedGenre('all');
    setSelectedLanguage('all');
    setSelectedType('all');
    setSearchQuery('');
    setActiveSearch('');
    if (onCategoryChange) onCategoryChange('trending');
  };

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      const nextPage = page + 1;
      if (activeSearch.trim() !== '') {
        fetchSearch(activeSearch.trim(), nextPage, true);
      } else {
        fetchCatalog(selectedCategory, selectedGenre, selectedLanguage, selectedType, nextPage, true);
      }
    }
  };

  const handleCategorySelect = (catId: string) => {
    if (onCategoryChange) {
      onCategoryChange(catId);
    }
    setActiveSearch('');
    setSearchQuery('');
  };

  const currentHero = spotlightItems[heroIndex] || items[0] || SAMPLE_MEDIA[0];
  const currentCategoryObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];
  
  // Custom filter is active if genre, language, or type is not 'all', or category is not 'trending', or searching
  const hasCustomFilter = selectedGenre !== 'all' || selectedLanguage !== 'all' || selectedType !== 'all' || selectedCategory !== 'trending' || activeSearch.trim() !== '';
  const isHomePage = !hasCustomFilter;

  // Curated subsets for Home page multi-row layout from rich SAMPLE_MEDIA + items
  const combinedMedia = [...items, ...SAMPLE_MEDIA];
  const getUniqueItems = (filteredList: MediaItem[], limit = 6) => {
    const seen = new Set<number>();
    const result: MediaItem[] = [];
    for (const item of filteredList) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        result.push(item);
        if (result.length >= limit) break;
      }
    }
    return result;
  };

  // Helper to test if media item is Bollywood
  const isBollywood = (i: MediaItem) => i.originalLanguage === 'hi' || i.language === 'Hindi' || i.genres?.includes('Bollywood');

  // Segregated Shelves
  const rawNewReleases = newReleasesShelf.length > 0 
    ? newReleasesShelf 
    : combinedMedia.filter(i => i.type === 'movie' && (i.year >= 2024 || i.featured));
  // Prioritize Bollywood movies at the very front of New Releases!
  const sortedNewReleases = [...rawNewReleases].sort((a, b) => (isBollywood(b) ? 1 : 0) - (isBollywood(a) ? 1 : 0));
  const displayNewReleases = getUniqueItems(sortedNewReleases);
  const hindiTitles = getUniqueItems(combinedMedia.filter(i => isBollywood(i)));
  const koreanTitles = getUniqueItems(combinedMedia.filter(i => i.originalLanguage === 'ko' || i.language === 'Korean' || i.genres?.includes('K-Drama')));
  const trendingMovies = getUniqueItems(combinedMedia.filter(i => i.type === 'movie'));
  const trendingSeries = getUniqueItems(combinedMedia.filter(i => i.type === 'tv'));
  const actionTitles = getUniqueItems(combinedMedia.filter(i => i.genres?.includes('Action')));
  const comedyTitles = getUniqueItems(combinedMedia.filter(i => i.genres?.includes('Comedy')));
  const horrorTitles = getUniqueItems(combinedMedia.filter(i => i.genres?.includes('Horror') || i.genres?.includes('Thriller')));
  const romanceTitles = getUniqueItems(combinedMedia.filter(i => i.genres?.includes('Romance') || i.genres?.includes('Drama')));
  const top4kTitles = getUniqueItems(combinedMedia.filter(i => (i.rating && i.rating >= 7.8)));
  const animeTitles = getUniqueItems(combinedMedia.filter(i => i.genres?.includes('Animation') || i.genres?.includes('Anime') || i.originalLanguage === 'ja'));

  return (
    <div className="space-y-8">
      {/* Featured Cinematic Hero Banner with Interactive Carousel */}
      {currentHero && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-950 min-h-[420px] sm:min-h-[480px] flex items-end">
          {/* High-res backdrop with dark gradient scrims */}
          <div className="absolute inset-0 z-0">
            <img
              src={currentHero.backdrop || currentHero.poster}
              alt={currentHero.title}
              className="w-full h-full object-cover object-center opacity-70 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/80 to-transparent" />
          </div>

          {/* Hero Content Left */}
          <div className="relative z-10 p-6 sm:p-10 max-w-2xl lg:max-w-3xl space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono bg-rose-600 text-white shadow-md shadow-rose-600/30 flex items-center gap-1">
                <Flame className="w-3 h-3 fill-white" />
                Featured Spotlight
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-slate-900/90 text-slate-200 border border-slate-700">
                {currentHero.type === 'tv' ? 'TV Series' : 'Movie'}
              </span>
              {currentHero.language && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-950/70 text-rose-300 border border-rose-800">
                  {currentHero.language}
                </span>
              )}
              {currentHero.rating && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {currentHero.rating} / 10
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 text-emerald-400 border border-emerald-800">
                4K Ultra HD
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentHero.year || 2024}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {currentHero.title}
            </h2>

            {currentHero.tagline && (
              <p className="text-xs sm:text-sm italic text-rose-300/90 font-medium">
                "{currentHero.tagline}"
              </p>
            )}

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-xl">
              {currentHero.overview}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelectMedia(currentHero)}
                className="px-6 py-3 bg-gradient-to-r from-red-500 via-rose-600 to-sky-500 hover:from-red-400 hover:to-sky-400 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all hover:scale-105 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Watch Now (Free HD/4K)
              </button>

              <button
                onClick={() => handleToggleBookmark(currentHero)}
                className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                  watchlist.includes(currentHero.id)
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900/85 hover:bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                {watchlist.includes(currentHero.id) ? 'In Watchlist' : 'Add to List'}
              </button>
            </div>
          </div>

          {/* Interactive Slide Selector */}
          {spotlightItems.length > 1 && (
            <div className="absolute right-4 bottom-4 z-20 hidden lg:flex items-center gap-2 p-2 rounded-xl bg-slate-950/75 backdrop-blur-md border border-slate-800/80">
              {spotlightItems.map((item, idx) => (
                <button
                  key={`hero-thumb-${item.id}-${idx}`}
                  onClick={() => setHeroIndex(idx)}
                  className={`relative w-12 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    heroIndex === idx
                      ? 'border-rose-500 scale-105 shadow-md shadow-rose-500/40'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                  title={item.title}
                >
                  <SmartPoster
                    src={item.poster}
                    alt={item.title}
                    title={item.title}
                    type={item.type}
                    year={item.year}
                    className="w-full h-full object-cover"
                    showTitleOnFallback={false}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Streaming Servers Fast Strip */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 text-slate-300 font-semibold shrink-0">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Default Stream Engine:</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-400/30 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Videasy 4K (4K Ultra HD • Auto-Play Ready)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline-block">
            Direct 4K Playback
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hidden md:inline-block">
            Adaptive Resolution
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Direct High-Speed Play</span>
        </div>
      </div>

      {/* Continue Watching Shelf (Only if user has history) */}
      {continueWatchingList.length > 0 && selectedCategory === 'trending' && !hasCustomFilter && (
        <section className="space-y-3 p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm sm:text-base font-bold text-white">Continue Watching</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30">
                {continueWatchingList.length}
              </span>
            </div>
          </div>

          <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
            {continueWatchingList.map((item) => (
              <div
                key={`cw-home-${item.mediaId}-${item.season || 0}-${item.episode || 0}`}
                onClick={() => onSelectMedia({
                  id: item.mediaId,
                  title: item.title,
                  type: item.type,
                  poster: item.poster || '',
                  backdrop: item.backdrop || '',
                  overview: `Continue watching ${item.title}`
                })}
                className="group relative flex-shrink-0 w-32 sm:w-40 bg-slate-900 border border-slate-800 hover:border-rose-500/60 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.03] shadow-md flex flex-col"
              >
                <div className="relative aspect-[2/3] bg-slate-950 overflow-hidden">
                  <SmartPoster
                    src={item.poster}
                    alt={item.title}
                    title={item.title}
                    type={item.type}
                    className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
                    showTitleOnFallback={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/50 transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {item.type === 'tv' && item.season && item.episode && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-sky-600/90 text-white text-[10px] font-bold font-mono shadow-md">
                      S{item.season}:E{item.episode}
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-800">
                    <div className="h-full bg-rose-500 w-3/4" />
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
                  <h4 className="text-xs font-semibold text-white group-hover:text-rose-400 truncate">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span className="uppercase">{item.type}</span>
                    <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                      <Play className="w-2.5 h-2.5 fill-current" /> Resume
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mobile Active Filter Badge (Only shown if custom filter is active) */}
      {hasCustomFilter && (
        <div className="md:hidden flex items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl shadow-md text-xs">
          <div className="flex items-center gap-2 truncate text-slate-300">
            <span className="text-slate-500 font-semibold text-[11px]">Filter:</span>
            <span className="text-rose-400 font-bold truncate">
              {selectedCategory !== 'trending' ? currentCategoryObj.name : ''}
              {selectedGenre !== 'all' ? ` • ${GENRE_OPTIONS.find(g => g.id === selectedGenre)?.label}` : ''}
              {selectedLanguage !== 'all' ? ` • ${LANGUAGE_OPTIONS.find(l => l.id === selectedLanguage)?.label}` : ''}
              {selectedType !== 'all' ? ` • ${selectedType === 'movie' ? 'Movies' : 'TV Shows'}` : ''}
              {activeSearch.trim() !== '' ? ` • "${activeSearch}"` : ''}
            </span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-rose-400 hover:text-white px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 shrink-0 cursor-pointer transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* 🚀 Comprehensive Granular Filter & Segmentation Control Bar - Hidden on Mobile, Visible on Desktop */}
      <div className="hidden md:block bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Category Pills Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Filter className="w-4 h-4 text-rose-400" />
            <span>Categories & Discover</span>
          </div>

          {hasCustomFilter && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Horizontal Category Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id && activeSearch.trim() === '';
            return (
              <button
                key={`cat-pill-${cat.id}`}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Granular Genre, Language, Type & Search Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 border-t border-slate-800/60">
          {/* Genre Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>🎭 Genre</span>
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setActiveSearch('');
              }}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-950 border border-slate-700/90 text-slate-200 rounded-xl focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={`genre-opt-${g.id}`} value={g.id} className="bg-slate-900 text-slate-200">
                  {g.emoji} {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>🌐 Language (भाषा)</span>
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setActiveSearch('');
              }}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-950 border border-slate-700/90 text-slate-200 rounded-xl focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={`lang-opt-${l.id}`} value={l.id} className="bg-slate-900 text-slate-200">
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Media Type Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>🎬 Content Type</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700/90">
              <button
                type="button"
                onClick={() => setSelectedType('all')}
                className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedType === 'all'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('movie')}
                className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedType === 'movie'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Movies
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('tv')}
                className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedType === 'tv'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Series
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>🔍 Quick Search</span>
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search titles, actors..."
                className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-slate-950 border border-slate-700/90 text-slate-200 rounded-xl focus:outline-none focus:border-rose-500 placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Chips Strip */}
        {hasCustomFilter && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs border-t border-slate-800/80">
            <span className="text-slate-400 font-semibold text-[11px]">Active Filters:</span>
            {selectedCategory !== 'trending' && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-white border border-slate-700 flex items-center gap-1 font-medium">
                <span>Category: {currentCategoryObj.name}</span>
                <X 
                  className="w-3 h-3 cursor-pointer text-slate-400 hover:text-white" 
                  onClick={() => handleCategorySelect('trending')}
                />
              </span>
            )}
            {selectedGenre !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800/80 flex items-center gap-1 font-medium">
                <span>Genre: {GENRE_OPTIONS.find(g => g.id === selectedGenre)?.label}</span>
                <X 
                  className="w-3 h-3 cursor-pointer text-rose-400 hover:text-white" 
                  onClick={() => setSelectedGenre('all')}
                />
              </span>
            )}
            {selectedLanguage !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-950/60 text-blue-300 border border-blue-800/80 flex items-center gap-1 font-medium">
                <span>Language: {LANGUAGE_OPTIONS.find(l => l.id === selectedLanguage)?.label}</span>
                <X 
                  className="w-3 h-3 cursor-pointer text-blue-400 hover:text-white" 
                  onClick={() => setSelectedLanguage('all')}
                />
              </span>
            )}
            {selectedType !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-950/60 text-purple-300 border border-purple-800/80 flex items-center gap-1 font-medium">
                <span>Type: {selectedType === 'movie' ? 'Movies Only' : 'TV Shows Only'}</span>
                <X 
                  className="w-3 h-3 cursor-pointer text-purple-400 hover:text-white" 
                  onClick={() => setSelectedType('all')}
                />
              </span>
            )}
            {activeSearch.trim() !== '' && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/80 flex items-center gap-1 font-medium">
                <span>Query: "{activeSearch}"</span>
                <X 
                  className="w-3 h-3 cursor-pointer text-amber-400 hover:text-white" 
                  onClick={handleClearSearch}
                />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Continue Watching Section (If history exists) */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              Continue Watching ({history.length})
            </h3>
            <button
              onClick={() => {
                localStorage.removeItem('autostream_history');
                setHistory([]);
              }}
              className="text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer"
            >
              Clear History
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {history.map((hist, histIdx) => {
              const itemObj: MediaItem = {
                id: hist.mediaId,
                title: hist.title,
                poster: hist.poster,
                backdrop: hist.poster,
                type: hist.type,
                year: 2024,
                overview: ''
              };

              return (
                <div
                  key={`hist-${hist.mediaId}-${histIdx}`}
                  onClick={() => onSelectMedia(itemObj)}
                  className="shrink-0 w-44 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-rose-500/80 cursor-pointer transition-all hover:scale-[1.02] shadow-md group"
                >
                  <div className="relative aspect-video bg-slate-950">
                    <SmartPoster
                      src={hist.poster}
                      alt={hist.title}
                      title={hist.title}
                      type={hist.type}
                      className="w-full h-full object-cover group-hover:opacity-80"
                      showTitleOnFallback={false}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h5 className="text-xs font-semibold text-white truncate">
                      {hist.title}
                    </h5>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      {hist.season && hist.episode ? (
                        <span className="font-mono text-rose-400">S{hist.season}:E{hist.episode}</span>
                      ) : (
                        <span className="font-mono uppercase">{hist.type}</span>
                      )}
                      <span className="text-rose-400 font-semibold">Resume &rarr;</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🌟 When On Default Home View -> Segregated Shelves by Genre & Language */}
      {isHomePage ? (
        <div className="space-y-12">
          {/* Row 1: 🆕 New Releases (Last 21 Days) Shelf */}
          {displayNewReleases.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                        New Releases
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                        Last 21 Days
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Fresh movies released in the last 21 days</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCategorySelect('new_releases')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All (21 Days)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {displayNewReleases.slice(0, 6).map((item, idx) => (
                  <MediaCard
                    key={`home-new-releases-${item.id}-${idx}`}
                    item={item}
                    onSelect={onSelectMedia}
                    isBookmarked={watchlist.includes(item.id)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Row 2: 🇮🇳 Bollywood Spotlight */}
          {hindiTitles.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇮🇳</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                      Bollywood Spotlight
                    </h3>
                    <p className="text-[11px] text-slate-400">Top Bollywood blockbuster movies & cinema</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleCategorySelect('hindi');
                    setSelectedLanguage('hi');
                  }}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All Bollywood</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {hindiTitles.map((item, idx) => (
                  <MediaCard
                    key={`home-hindi-${item.id}-${idx}`}
                    item={item}
                    onSelect={onSelectMedia}
                    isBookmarked={watchlist.includes(item.id)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Row 2: 🇰🇷 K-Drama & Asian Wave */}
          {koreanTitles.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇰🇷</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                      K-Drama & Korean Sensations
                    </h3>
                    <p className="text-[11px] text-slate-400">Binge-worthy Korean series and award-winning cinema</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleCategorySelect('korean');
                    setSelectedLanguage('ko');
                  }}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All K-Drama</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {koreanTitles.map((item, idx) => (
                  <MediaCard
                    key={`home-korean-${item.id}-${idx}`}
                    item={item}
                    onSelect={onSelectMedia}
                    isBookmarked={watchlist.includes(item.id)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Row 3: 🔥 Trending Movies Worldwide */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    Trending Movies Worldwide
                  </h3>
                  <p className="text-[11px] text-slate-400">Most streamed movies across servers today</p>
                </div>
              </div>
              <button
                onClick={() => handleCategorySelect('popular_movies')}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All Movies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trendingMovies.map((item, idx) => (
                <MediaCard
                  key={`home-movie-${item.id}-${idx}`}
                  item={item}
                  onSelect={onSelectMedia}
                  isBookmarked={watchlist.includes(item.id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          </div>

          {/* Row 4: 📺 Hit TV & Web Series */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    Popular TV & Web Series
                  </h3>
                  <p className="text-[11px] text-slate-400">Complete seasons with multi-resolver episodes</p>
                </div>
              </div>
              <button
                onClick={() => handleCategorySelect('popular_tv')}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All Series</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trendingSeries.map((item, idx) => (
                <MediaCard
                  key={`home-tv-${item.id}-${idx}`}
                  item={item}
                  onSelect={onSelectMedia}
                  isBookmarked={watchlist.includes(item.id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          </div>

          {/* Row 5: 💥 High-Octane Action Blockbusters */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    High-Octane Action & Thrills
                  </h3>
                  <p className="text-[11px] text-slate-400">Adrenaline, superhero, and crime action</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedGenre('action');
                }}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {actionTitles.map((item, idx) => (
                <MediaCard
                  key={`home-action-${item.id}-${idx}`}
                  item={item}
                  onSelect={onSelectMedia}
                  isBookmarked={watchlist.includes(item.id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          </div>

          {/* Row 6: 🍿 Comedy & Feel-Good Hits */}
          {comedyTitles.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍿</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                      Comedy & Feel-Good Laughs
                    </h3>
                    <p className="text-[11px] text-slate-400">Lighthearted cinema, sitcoms, and comedy specials</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGenre('comedy')}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All Comedy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {comedyTitles.map((item, idx) => (
                  <MediaCard
                    key={`home-comedy-${item.id}-${idx}`}
                    item={item}
                    onSelect={onSelectMedia}
                    isBookmarked={watchlist.includes(item.id)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Row 7: 👻 Horror & Supernatural Chills */}
          {horrorTitles.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">👻</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                      Horror & Mystery Nights
                    </h3>
                    <p className="text-[11px] text-slate-400">Jump scares, paranormal thrills, and psychological suspense</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGenre('horror')}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All Horror</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {horrorTitles.map((item, idx) => (
                  <MediaCard
                    key={`home-horror-${item.id}-${idx}`}
                    item={item}
                    onSelect={onSelectMedia}
                    isBookmarked={watchlist.includes(item.id)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Row 8: ⚡ Anime Series & Animations */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    Top Anime Hits
                  </h3>
                  <p className="text-[11px] text-slate-400">Legendary anime sagas and latest seasonal episodes</p>
                </div>
              </div>
              <button
                onClick={() => handleCategorySelect('anime')}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All Anime</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {animeTitles.map((item, idx) => (
                <MediaCard
                  key={`home-anime-${item.id}-${idx}`}
                  item={item}
                  onSelect={onSelectMedia}
                  isBookmarked={watchlist.includes(item.id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          </div>

          {/* Row 9: ⭐ 4K Ultra HD & Classics */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    4K Ultra HD Masterpieces
                  </h3>
                  <p className="text-[11px] text-slate-400">Crisp, uncompressed high bitrate cinema</p>
                </div>
              </div>
              <button
                onClick={() => handleCategorySelect('top_rated_movies')}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All 4K</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {top4kTitles.map((item, idx) => (
                <MediaCard
                  key={`home-4k-${item.id}-${idx}`}
                  item={item}
                  onSelect={onSelectMedia}
                  isBookmarked={watchlist.includes(item.id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          </div>

          {/* Browse by Language Interactive Hub */}
          <div className="space-y-3.5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <Globe className="w-5 h-5 text-rose-400" />
                Browse by Language (भाषा अनुसार फिल्में)
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { id: 'hi', label: 'Bollywood', native: 'बॉलीवुड सिनेमा', flag: '🇮🇳' },
                { id: 'en', label: 'English (Hollywood)', native: 'Hollywood Global', flag: '🇺🇸' },
                { id: 'ko', label: 'Korean (K-Drama)', native: '한국 드라마', flag: '🇰🇷' },
                { id: 'ja', label: 'Japanese (Anime)', native: '日本 アニメ', flag: '🇯🇵' },
                { id: 'te', label: 'Telugu (Tollywood)', native: 'తెలుగు సినిమాలు', flag: '🇮🇳' },
                { id: 'ta', label: 'Tamil (Kollywood)', native: 'தமிழ் படங்கள்', flag: '🇮🇳' },
                { id: 'es', label: 'Spanish (Español)', native: 'Cine en Español', flag: '🇪🇸' },
                { id: 'fr', label: 'French (Français)', native: 'Cinéma Français', flag: '🇫🇷' },
                { id: 'pa', label: 'Punjabi Cinema', native: 'ਪੰਜਾਬੀ ਫ਼ਿਲਮਾਂ', flag: '🇮🇳' },
                { id: 'all', label: 'All Global Cinema', native: 'All Languages', flag: '🌐' }
              ].map((lang) => (
                <button
                  key={`lang-hub-${lang.id}`}
                  onClick={() => {
                    setSelectedLanguage(lang.id);
                    if (lang.id === 'hi') handleCategorySelect('hindi');
                    else if (lang.id === 'ko') handleCategorySelect('korean');
                    else handleCategorySelect('trending');
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-rose-500/60 hover:bg-slate-800/80 text-left transition-all group cursor-pointer"
                >
                  <div className="text-2xl mb-1">{lang.flag}</div>
                  <div className="font-bold text-xs sm:text-sm text-white group-hover:text-rose-400 transition-colors truncate">
                    {lang.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {lang.native}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Browse by Genre Interactive Grid */}
          <div className="space-y-3.5 pt-4 border-t border-slate-800/80">
            <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-400" />
              Explore All Genres
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {GENRE_OPTIONS.filter(g => g.id !== 'all').map((genre) => (
                <button
                  key={`genre-hub-${genre.id}`}
                  onClick={() => setSelectedGenre(genre.id)}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-rose-500/60 hover:bg-slate-800/80 text-left transition-all group cursor-pointer"
                >
                  <div className="text-2xl mb-1">{genre.emoji}</div>
                  <div className="font-bold text-xs sm:text-sm text-white group-hover:text-rose-400 transition-colors">
                    {genre.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Stream in HD
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Dedicated Segregated / Filtered / Search Results View */
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-400/20">
                {currentCategoryObj.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  {activeSearch.trim() !== '' ? (
                    <>Search Results for "{activeSearch}"</>
                  ) : (
                    <>
                      {currentCategoryObj.name}
                      {selectedGenre !== 'all' && ` • ${GENRE_OPTIONS.find(g => g.id === selectedGenre)?.label}`}
                      {selectedLanguage !== 'all' && ` • ${LANGUAGE_OPTIONS.find(l => l.id === selectedLanguage)?.label}`}
                      {selectedType !== 'all' && ` (${selectedType === 'movie' ? 'Movies' : 'TV Shows'})`}
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeSearch.trim() !== ''
                    ? `${totalResults} matching titles found on TMDB`
                    : `${items.length} titles currently displayed • ${totalResults.toLocaleString()} total available`}
                </p>
              </div>
            </div>

            {/* Clear Filter / Back to Home Button */}
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors self-start sm:self-center cursor-pointer border border-slate-700"
            >
              <span>&larr; Back to Home</span>
            </button>
          </div>

          {/* Loading Spinner */}
          {isLoading ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-16 text-center space-y-4">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">
                Resolving titles from TMDB & mapping to Ansh's Flix resolvers...
              </p>
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-16 text-center space-y-4">
              <Film className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-semibold text-white">No matching titles found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {activeSearch
                  ? `No movies or TV shows matched your query "${activeSearch}". Try searching with a different keyword.`
                  : selectedCategory === 'watchlist'
                  ? 'Your watchlist is currently empty. Click the bookmark icon on any title to save it here.'
                  : 'No titles matched the selected genre and language combination. Try relaxing your filters.'}
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-500 transition-colors cursor-pointer shadow-md shadow-rose-600/30"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Title Cards Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {items.map((item, idx) => (
                <MediaCard
                  key={`catalog-${item.id}-${item.type}-${idx}`}
                  item={item}
                  onSelect={onSelectMedia}
                  isBookmarked={watchlist.includes(item.id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          )}

          {/* Load More Titles Button / Bottom Pagination */}
          {items.length > 0 && page < totalPages && (
            <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-800/80">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 py-3 bg-gradient-to-r from-red-500 via-rose-600 to-sky-500 hover:from-red-400 hover:to-sky-400 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading Next Batch...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Load More Titles (+20)
                  </>
                )}
              </button>

              <div className="text-xs text-slate-400 font-mono">
                Showing {items.length} of {totalResults.toLocaleString()} titles
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
