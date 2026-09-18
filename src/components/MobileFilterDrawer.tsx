import React from 'react';
import { 
  X, 
  Search, 
  Filter, 
  RotateCcw, 
  Check, 
  Film, 
  Tv, 
  Sparkles, 
  Flame, 
  Star, 
  Bookmark, 
  Globe, 
  Zap, 
  TrendingUp, 
  Clapperboard,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  description?: string;
}

export interface GenreItem {
  id: string;
  label: string;
  emoji: string;
}

export interface LanguageItem {
  id: string;
  label: string;
  flag: string;
}

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  genres: GenreItem[];
  selectedGenre: string;
  onSelectGenre: (genreId: string) => void;
  languages: LanguageItem[];
  selectedLanguage: string;
  onSelectLanguage: (langId: string) => void;
  selectedType: string;
  onSelectType: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  genres,
  selectedGenre,
  onSelectGenre,
  languages,
  selectedLanguage,
  onSelectLanguage,
  selectedType,
  onSelectType,
  searchQuery,
  onSearchChange,
  onResetFilters,
}) => {
  if (!isOpen) return null;

  const hasActiveFilters = 
    selectedCategory !== 'trending' || 
    selectedGenre !== 'all' || 
    selectedLanguage !== 'all' || 
    selectedType !== 'all' || 
    searchQuery.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Left Drawer */}
      <div className="relative w-[88vw] max-w-sm bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-250">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800/90 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Filters & Categories
              </h3>
              <p className="text-[11px] text-slate-400">
                Explore movies, series & genres
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
          {/* Quick Search */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-rose-400" />
              <span>Search Titles & Cast</span>
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search movies, anime, series..."
                className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Content Type Tabs */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-sky-400" />
              <span>Content Type</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onSelectType('all')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedType === 'all'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => onSelectType('movie')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedType === 'movie'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => onSelectType('tv')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedType === 'tv'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Series
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-rose-400" />
                <span>Categories</span>
              </span>
              <span className="text-[10px] text-slate-400 lowercase font-mono">
                {categories.length} sections
              </span>
            </label>
            <div className="space-y-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-rose-600/20 text-rose-300 border-rose-500/50 shadow-xs'
                        : 'bg-slate-900/50 hover:bg-slate-900 text-slate-300 border-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="shrink-0">{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </div>
                    {isActive && (
                      <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genre Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎭 Popular Genres</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {genres.map((g) => {
                const isSelected = selectedGenre === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => onSelectGenre(g.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left truncate cursor-pointer border ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    <span>{g.emoji}</span>
                    <span className="truncate">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌐 Language (भाषा)</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {languages.map((l) => {
                const isSelected = selectedLanguage === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => onSelectLanguage(l.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left truncate cursor-pointer border ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span className="truncate">{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
          >
            <span>Apply & Browse</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
