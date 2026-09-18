import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  ChevronDown, 
  Check, 
  Clock, 
  Tv, 
  Sparkles, 
  Volume2, 
  Loader2,
  Film
} from 'lucide-react';
import { MediaItem } from '../types';

export interface EpisodeData {
  season: number;
  episode: number;
  title: string;
  runtime?: string;
  still?: string | null;
  overview?: string;
}

interface NetflixEpisodesListProps {
  media: MediaItem;
  currentSeason: number;
  currentEpisode: number;
  episodes: EpisodeData[];
  isLoading: boolean;
  onSelectSeason: (season: number) => void;
  onSelectEpisode: (episode: number) => void;
}

export const NetflixEpisodesList: React.FC<NetflixEpisodesListProps> = ({
  media,
  currentSeason,
  currentEpisode,
  episodes,
  isLoading,
  onSelectSeason,
  onSelectEpisode
}) => {
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalSeasons = Math.max(media.seasons || 1, currentSeason);

  // Close season dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSeasonDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEpisodeClick = (epNum: number) => {
    onSelectEpisode(epNum);
    // Smoothly scroll up towards video player
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div id="netflix-episodes-container" className="space-y-6 pt-2">
      {/* Netflix Header: Section Title & Season Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Episodes
            </h3>
            {isLoading && (
              <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {media.title} • Season {currentSeason} ({episodes.length || media.episodesPerSeason || 8} Episodes)
          </p>
        </div>

        {/* Netflix-Style Season Dropdown + Tabs */}
        <div className="flex items-center gap-2.5">
          {/* Custom Netflix Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="netflix-season-dropdown-btn"
              type="button"
              onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)}
              className="flex items-center justify-between gap-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-md border border-slate-700/80 hover:border-slate-500 transition-all shadow-md cursor-pointer min-w-[140px]"
              aria-expanded={seasonDropdownOpen}
            >
              <span>Season {currentSeason}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${seasonDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Netflix Dark Floating Dropdown Menu */}
            {seasonDropdownOpen && (
              <div 
                id="netflix-season-dropdown-menu"
                className="absolute right-0 mt-1.5 w-56 bg-slate-950/98 backdrop-blur-md border border-slate-700/90 rounded-lg shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  Select Season
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => {
                    const isSelected = currentSeason === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          onSelectSeason(s);
                          setSeasonDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-red-600/20 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={isSelected ? 'text-red-400' : 'text-slate-400'}>
                            Season {s}
                          </span>
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Season Pills for Fast 1-Click Access */}
          {totalSeasons <= 6 && (
            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto">
              {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSelectSeason(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    currentSeason === s
                      ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                      : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  S{s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && episodes.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((idx) => (
            <div 
              key={idx} 
              className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 animate-pulse"
            >
              <div className="w-8 h-8 bg-slate-800 rounded hidden sm:block shrink-0" />
              <div className="w-full sm:w-52 aspect-video bg-slate-800 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2 w-full pt-1">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-800/70 rounded w-full" />
                <div className="h-3 bg-slate-800/70 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Netflix Episode Rows */}
      <div className="space-y-3">
        {episodes.map((ep) => {
          const isSelected = ep.episode === currentEpisode;
          const thumbnailSrc = ep.still || media.backdrop || media.poster;
          const epTitle = ep.title || `Episode ${ep.episode}`;
          const epDuration = ep.runtime || '45m';
          const epOverview = ep.overview && ep.overview.trim() !== ''
            ? ep.overview
            : `Follow the gripping story in Episode ${ep.episode} of ${media.title} as tensions escalate and new secrets unfold.`;

          return (
            <div
              key={`${ep.season}-${ep.episode}`}
              id={`episode-card-${ep.episode}`}
              onClick={() => handleEpisodeClick(ep.episode)}
              className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-3.5 sm:p-4 rounded-xl transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? 'bg-slate-800/90 border-red-500/50 shadow-lg shadow-red-950/20'
                  : 'bg-slate-900/60 hover:bg-slate-800/70 border-slate-800/70 hover:border-slate-700'
              }`}
            >
              {/* Episode Number - Netflix large clean typography */}
              <div className="hidden sm:flex items-center justify-center w-7 sm:w-9 shrink-0">
                <span className={`text-xl sm:text-2xl font-bold transition-colors ${
                  isSelected ? 'text-red-500 font-extrabold' : 'text-slate-400 group-hover:text-white'
                }`}>
                  {ep.episode}
                </span>
              </div>

              {/* Episode Thumbnail Container (16:9 Aspect Ratio) */}
              <div className="relative w-full sm:w-48 md:w-56 shrink-0 aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800/90 group-hover:border-slate-600 shadow-md">
                <img
                  src={thumbnailSrc}
                  alt={epTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to show backdrop or poster if still image fails
                    const target = e.target as HTMLImageElement;
                    if (target.src !== media.backdrop && media.backdrop) {
                      target.src = media.backdrop;
                    } else if (target.src !== media.poster && media.poster) {
                      target.src = media.poster;
                    }
                  }}
                />

                {/* Gradient shadow for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Center Play Button Overlay on Hover */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 ${
                    isSelected 
                      ? 'bg-red-600 text-white scale-105' 
                      : 'bg-black/70 backdrop-blur-xs border border-white/40 text-white group-hover:scale-105'
                  }`}>
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Now Playing Active Indicator Pill */}
                {isSelected && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                    <Volume2 className="w-3 h-3 animate-pulse" />
                    <span>Now Playing</span>
                  </div>
                )}

                {/* Duration Badge */}
                <div className="absolute bottom-1.5 right-1.5 bg-black/85 backdrop-blur-xs text-slate-200 text-[10px] sm:text-[11px] font-mono font-semibold px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {epDuration}
                </div>
              </div>

              {/* Episode Information (Title, Meta, Description) */}
              <div className="flex-1 min-w-0 space-y-1.5 w-full">
                {/* Title Line */}
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-red-400 transition-colors truncate">
                    <span className="sm:hidden text-slate-400 mr-2 font-mono">{ep.episode}.</span>
                    {epTitle}
                  </h4>

                  <span className="text-xs text-slate-400 font-mono hidden sm:inline-block shrink-0">
                    {epDuration}
                  </span>
                </div>

                {/* Netflix-Style Episode Description Synopsis */}
                <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed line-clamp-3 sm:line-clamp-2">
                  {epOverview}
                </p>

                {/* Interactive Action Indicator */}
                <div className="pt-1 flex items-center gap-3 text-xs">
                  <span className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                    isSelected ? 'text-red-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}>
                    <Play className="w-3 h-3 fill-current" />
                    {isSelected ? 'Currently Streaming' : 'Play Episode'}
                  </span>

                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    Season {currentSeason} Episode {ep.episode}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
