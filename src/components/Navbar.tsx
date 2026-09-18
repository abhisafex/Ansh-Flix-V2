import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Search, 
  Bookmark, 
  X, 
  Star, 
  Menu, 
  Sparkles,
  User,
  Film,
  Tv,
  ArrowRight
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
  onSearchInCatalog?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectCategory,
  activeCategory = 'trending',
  tmdbConfigured,
  selectedTitle,
  onSelectMedia,
  onOpenMobileDrawer,
  onSearchInCatalog
}) => {
  const { user, isLoggedIn, setIsAuthModalOpen, setIsAccountModalOpen } = useAuth();
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
            setIsSearching(false);
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
    }, 280);
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

  const handleTriggerFullSearch = () => {
    if (!navSearch.trim()) return;
    setShowSearchDropdown(false);
    if (onSearchInCatalog) {
      onSearchInCatalog(navSearch.trim());
    } else {
      setActiveTab('browse');
      if (onSelectCategory) onSelectCategory('all');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          
          {/* Left Side: Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="mobile-hamburger-filter-btn"
              type="button"
              onClick={onOpenMobileDrawer}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-rose-500 hover:text-white hover:bg-slate-800 flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-all"
              title="Open Categories & Search Filter"
              aria-label="Open Categories & Search Filter"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo - Ansh's Flix v2 */}
            <div 
              onClick={() => handleNavCategory('trending')}
              className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500 via-rose-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform duration-300">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white translate-x-0.5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                    Ansh's <span className="text-rose-500">Flix</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-extrabold">
                    v2
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Concise Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-semibold shrink-0">
            <button
              onClick={() => handleNavCategory('trending')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'browse' && activeCategory === 'trending'
                  ? 'text-white bg-rose-600 font-bold shadow-sm shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/90'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavCategory('popular_movies')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'browse' && activeCategory === 'popular_movies'
                  ? 'text-white bg-rose-600 font-bold shadow-sm shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/90'
              }`}
            >
              Movies
            </button>

            <button
              onClick={() => handleNavCategory('popular_tv')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'browse' && activeCategory === 'popular_tv'
                  ? 'text-white bg-rose-600 font-bold shadow-sm shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/90'
              }`}
            >
              TV Shows
            </button>

            <button
              onClick={() => handleNavCategory('hindi')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'browse' && activeCategory === 'hindi'
                  ? 'text-white bg-rose-600 font-bold shadow-sm shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/90'
              }`}
            >
              <span>🇮🇳</span>
              <span>Bollywood</span>
            </button>

            {isLoggedIn && (
              <button
                onClick={() => handleNavCategory('watchlist')}
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'browse' && activeCategory === 'watchlist'
                    ? 'text-white bg-rose-600 font-bold shadow-sm shadow-rose-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/90'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Watchlist</span>
              </button>
            )}
          </nav>

          {/* Prominent & Redesigned Search Bar */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md md:max-w-lg lg:max-w-xl mx-1 sm:mx-2">
            <div className="relative">
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={navSearch}
                onChange={handleSearchInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTriggerFullSearch();
                  }
                }}
                onFocus={() => {
                  if (searchResults.length > 0 || navSearch.trim().length > 0) {
                    setShowSearchDropdown(true);
                  }
                }}
                placeholder="Search movies, series, anime, Bollywood..."
                className="w-full pl-10 sm:pl-11 pr-10 py-2 sm:py-2.5 bg-slate-900/95 border border-slate-700/80 hover:border-slate-600 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden transition-all shadow-inner"
              />
              {navSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setNavSearch('');
                    setSearchResults([]);
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1 rounded-md hover:bg-slate-800 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Live Search Results Popover (Ultra Visible, Big Posters & Titles) */}
            {showSearchDropdown && (
              <div className="absolute top-full mt-2 left-0 right-0 sm:-right-8 md:right-0 bg-slate-950/98 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl divide-y divide-slate-800/80 max-h-[75vh] overflow-y-auto">
                <div className="px-4 py-2.5 text-xs font-mono font-bold text-slate-300 flex items-center justify-between bg-slate-900/90 border-b border-slate-800">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <Search className="w-3.5 h-3.5" />
                    SEARCH RESULTS
                  </span>
                  {isSearching ? (
                    <span className="text-rose-400 animate-pulse text-[11px]">Searching TMDB...</span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">{searchResults.length} titles found</span>
                  )}
                </div>

                {searchResults.length === 0 && !isSearching && (
                  <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                    <p>No titles found matching "<span className="text-white font-semibold">{navSearch}</span>".</p>
                    <p className="text-[11px] text-slate-500">Try searching for full names, actors, or alternate spellings.</p>
                  </div>
                )}

                {searchResults.map((item) => {
                  return (
                    <div
                      key={`search-item-${item.id}-${item.type}`}
                      onClick={() => handleSelectSearchResult(item)}
                      className="p-3 sm:p-3.5 hover:bg-slate-800/90 cursor-pointer flex items-center gap-3.5 transition-all group border-b border-slate-900/60 last:border-b-0"
                    >
                      {/* Big Clear Poster Image */}
                      <div className="w-16 h-22 sm:w-18 sm:h-26 overflow-hidden rounded-xl bg-slate-900 shrink-0 shadow-lg border border-slate-700/80 relative">
                        <SmartPoster
                          src={item.poster}
                          alt={item.title}
                          title={item.title}
                          type={item.type}
                          year={item.year}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          showTitleOnFallback={true}
                        />
                      </div>

                      {/* Content Details: Clear Title & Metadata */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-rose-400 line-clamp-2 leading-snug transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 shrink-0 font-bold">
                            {item.type === 'tv' ? 'Series' : 'Movie'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1.5">
                          <span className="font-mono text-slate-300 font-semibold">{item.year || 2024}</span>
                          {item.rating && (
                            <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {item.rating}
                            </span>
                          )}
                          {item.genres && item.genres.length > 0 && (
                            <span className="text-slate-400 line-clamp-1">
                              • {item.genres.slice(0, 2).join(' • ')}
                            </span>
                          )}
                        </div>

                        {item.overview && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-normal opacity-90">
                            {item.overview}
                          </p>
                        )}
                      </div>

                      {/* Watch Action Button */}
                      <div className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-600 group-hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-rose-600/30 transition-all shrink-0">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline">Watch</span>
                      </div>
                    </div>
                  );
                })}

                {/* Footer to explore full catalog */}
                {navSearch.trim() && (
                  <button
                    type="button"
                    onClick={handleTriggerFullSearch}
                    className="w-full py-3 px-4 bg-slate-900/95 hover:bg-slate-800 text-rose-400 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border-t border-slate-800"
                  >
                    <span>View all matching titles in Full Catalog for "{navSearch}"</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User Profile / Login Button */}
          {user ? (
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="p-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 text-slate-200 transition-all cursor-pointer shrink-0 shadow-sm hover:scale-105 active:scale-95 group relative"
              title={`My Account (${user.email}) - Click to manage watchlist & continue watching`}
              aria-label="User Account"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-md shadow-rose-600/30 group-hover:shadow-rose-500/50">
                {user.email[0].toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 cursor-pointer shadow-md shadow-rose-600/30 transition-all"
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
