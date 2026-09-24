import React from 'react';
import { Play, Star, Bookmark, BookmarkCheck } from 'lucide-react';
import { MediaItem } from '../types';
import { SmartPoster } from './SmartPoster';

interface MediaCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (item: MediaItem) => void;
  size?: 'normal' | 'large';
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onSelect,
  isBookmarked = false,
  onToggleBookmark,
  size = 'normal'
}) => {
  const isLarge = size === 'large';
  const is4K = (item.rating && item.rating >= 7.5) || item.id === 693134 || item.id === 872585 || item.genres?.includes('Action');

  const releaseBadge = React.useMemo(() => {
    if (!item.releaseDate) return null;
    const release = new Date(item.releaseDate);
    if (isNaN(release.getTime())) return null;
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 21) {
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1d ago';
      return `${diffDays}d ago`;
    }
    return null;
  }, [item.releaseDate]);

  return (
    <div className="group relative bg-slate-900/90 border border-slate-800/80 hover:border-sky-500/60 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/10 flex flex-col">
      {/* Poster with overlays */}
      <div 
        onClick={() => onSelect(item)}
        className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden cursor-pointer"
      >
        <SmartPoster
          src={item.poster}
          alt={item.title}
          title={item.title}
          type={item.type}
          year={item.year}
          genres={item.genres}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Top Badges */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-1 pointer-events-none">
          {releaseBadge ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-500/90 text-white shadow-xs backdrop-blur-md flex items-center gap-0.5">
              <span>✨</span>
              <span>{releaseBadge}</span>
            </span>
          ) : (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase backdrop-blur-md ${
              is4K ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-950/80 text-sky-400 border border-sky-400/30'
            }`}>
              {is4K ? '4K UHD' : 'HD 1080p'}
            </span>
          )}

          {item.rating && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-400/30 flex items-center gap-0.5 ml-auto">
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              {item.rating}
            </span>
          )}
        </div>

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/50 transform group-hover:scale-110 transition-transform duration-300">
            <Play className="w-5 h-5 fill-white translate-x-0.5" />
          </div>
        </div>

        {/* Bottom Year & Media Type Scrim */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-2.5 pt-7 flex items-center justify-between text-[11px] font-mono text-slate-300">
          <span>{item.year || 2024}</span>
          <div className="flex items-center gap-1">
            {item.language && (
              <span className="px-1.5 py-0.5 rounded bg-slate-900/90 text-rose-300 text-[9px] font-bold uppercase border border-rose-500/30">
                {item.language.split(' ')[0]}
              </span>
            )}
            <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 text-[10px] font-semibold uppercase border border-slate-700">
              {item.type === 'tv' ? 'Series' : 'Movie'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className={`flex-1 flex flex-col justify-between bg-slate-900/95 ${isLarge ? 'p-3.5 space-y-2.5' : 'p-3 space-y-2'}`}>
        <div>
          <h4 
            onClick={() => onSelect(item)}
            className={`font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-2 cursor-pointer leading-snug break-words ${
              isLarge ? 'text-sm sm:text-base min-h-[2.5rem]' : 'text-xs sm:text-sm min-h-[2rem]'
            }`}
            title={item.title}
          >
            {item.title}
          </h4>
          {item.genres && item.genres.length > 0 && (
            <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1 mt-1 font-medium">
              {item.genres.slice(0, 3).join(' • ')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-xs">
          <button
            onClick={() => onSelect(item)}
            className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5 text-xs cursor-pointer transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            Watch Now
          </button>

          {onToggleBookmark && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item);
              }}
              className="text-slate-400 hover:text-amber-400 p-1 rounded transition-colors cursor-pointer"
              title={isBookmarked ? "Remove from List" : "Add to List"}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-amber-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
