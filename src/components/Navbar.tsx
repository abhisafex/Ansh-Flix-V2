import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Search, 
  Bookmark, 
  X, 
  Star, 
  Menu, 
  SlidersHorizontal, 
  Sparkles,
  User
} from 'lucide-react';
import { MediaItem } from '../types';
import { SmartPoster } from './SmartPoster';
import { SAMPLE_MEDIA } from '../data/sampleMedia';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
  tmdbConfigured: boolean;
  selectedTitle?: string;
  onSelectMedia?: (item: MediaItem) => void;
  onOpenMobileDrawer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectCategory,
  activeCategory = 'trending',
  tmdbConfigured,
  selectedTitle,
  onSelectMedia,
  onOpenMobileDrawer
}) => {
  const { user, setIsAuthModalOpen, setIsAccountModalOpen } = useAuth();
  const [navSearch, setNavSearch] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNavSearch(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length === 0) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setShowSearchDropdown(true);
    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(val.trim())}&page=1`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setSearchResults(data.results.slice(0, 7));
            return;
          }
        }
      } catch {
        // Fall through to local fallback
      }

      // Safe local search fallback
      const q = val.trim().toLowerCase();
      const localMatches = SAMPLE_MEDIA.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.overview && m.overview.toLowerCase().includes(q))
      ).slice(0, 7);
      setSearchResults(localMatches);
      setIsSearching(false);
    }, 300);
  };

  const handleNavCategory = (catId: string) => {
    setActiveTab('browse');
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  const handleSelectSearchResult = (item: MediaItem) => {
    setShowSearchDropdown(false);
    setNavSearch('');
    if (onSelectMedia) {
      onSelectMedia(item);
    } else {
      setActiveTab('player');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Left Side: Mobile 3-Bar Hamburger Menu Button & Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="mobile-hamburger-filter-btn"
              type="button"
              onClick={onOpenMobileDrawer}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-rose-500 hover:text-white hover:bg-slate-800 flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-all"
              title="Open Categories & Search Filter (3-bar menu)"
              aria-label="Open Categories & Search Filter"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo - Ansh's Flix v1 */}
            <div 
              onClick={() => handleNavCategory('trending')}
              className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 via-rose-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-rose-600/30 group-hover:scale-105 transition-transform duration-300">
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">
                    Ansh's <span className="text-rose-500">Flix</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-extrabold">
                    v2
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 text-xs font-semibold">
            <button
              onClick={() => handleNavCategory('trending')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'browse' && activeCategory === 'trending'
                  ? 'text-rose-400 bg-rose-500/15 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavCategory('new_releases')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'browse' && activeCategory === 'new_releases'
                  ? 'text-emerald-400 bg-emerald-500/15 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>New Releases</span>
            </button>

            <button
              onClick={() => handleNavCategory('popular_movies')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'browse' && activeCategory === 'popular_movies'
                  ? 'text-rose-400 bg-rose-500/15 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Movies
            </button>

            <button
              onClick={() => handleNavCategory('popular_tv')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'browse' && activeCategory === 'popular_tv'
                  ? 'text-rose-400 bg-rose-500/15 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              TV Shows
            </button>

            <button
              onClick={() => handleNavCategory('hindi')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'browse' && activeCategory === 'hindi'
                  ? 'text-rose-400 bg-rose-500/15 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span className="text-[11px]">🇮🇳</span>
              <span>Bollywood</span>
            </button>

            <button
              onClick={() => handleNavCategory('anime')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'browse' && activeCategory === 'anime'
                  ? 'text-rose-400 bg-rose-500/15 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Anime
            </button>

            <button
              onClick={() => handleNavCategory('korean')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'browse' && activeCategory === 'korean'
                  ? 'text-rose-400 bg-rose-500/15 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              K-Drama
            </button>

            <button
              onClick={() => handleNavCategory('top_rated_movies')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'browse' && activeCategory === 'top_rated_movies'
                  ? 'text-rose-400 bg-rose-500/15 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              4K UHD
            </button>

            <button
              onClick={() => handleNavCategory('watchlist')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'browse' && activeCategory === 'watchlist'
                  ? 'text-rose-400 bg-rose-500/15 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist</span>
            </button>
          </nav>

          {/* Quick Live Search Bar with Dropdown Popover (Enlarged) */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl ml-auto sm:ml-2">
            <div className="relative">
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={navSearch}
                onChange={handleSearchInput}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                placeholder="Search movies, TV shows, anime, Bollywood..."
                className="w-full pl-10 sm:pl-11 pr-9 py-2.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
              />
              {navSearch && (
                <button
                  onClick={() => {
                    setNavSearch('');
                    setSearchResults([]);
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5 rounded-md hover:bg-slate-800 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Live Search Results Popover */}
            {showSearchDropdown && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-md divide-y divide-slate-800/70 max-h-96 overflow-y-auto">
                <div className="px-3.5 py-2.5 text-[11px] uppercase tracking-wider font-mono text-slate-400 flex items-center justify-between bg-slate-950/60">
                  <span>Search Results</span>
                  {isSearching && <span className="text-sky-400 animate-pulse">Searching...</span>}
                </div>

                {searchResults.length === 0 && !isSearching && (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No results found for "{navSearch}".
                  </div>
                )}

                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSearchResult(item)}
                    className="p-3 hover:bg-slate-800/80 cursor-pointer flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-10 h-14 overflow-hidden rounded-lg bg-slate-950 shrink-0 shadow-xs">
                      <SmartPoster
                        src={item.poster}
                        alt={item.title}
                        title={item.title}
                        type={item.type}
                        year={item.year}
                        className="w-full h-full object-cover"
                        showTitleOnFallback={false}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-sky-400 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{item.year || 2024}</span>
                        {item.rating && (
                          <span className="flex items-center gap-0.5 text-amber-400">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            {item.rating}
                          </span>
                        )}
                        {item.genres && item.genres.length > 0 && (
                          <span className="truncate text-slate-500">
                            • {item.genres[0]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Login Button */}
          {user ? (
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500/50 text-slate-200 transition-all cursor-pointer shrink-0 shadow-sm"
              title="My Account & Continue Watching"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 text-white font-bold flex items-center justify-center text-xs shadow-sm shadow-rose-600/30">
                {user.email[0].toUpperCase()}
              </div>
              <span className="hidden md:inline font-mono text-xs max-w-[100px] truncate font-medium">
                {user.email.split('@')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-sm shadow-rose-600/30 transition-all"
              title="Login with Email & PIN"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
