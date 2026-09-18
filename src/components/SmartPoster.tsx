import React, { useState, useEffect } from 'react';
import { Film, Clapperboard, Tv, AlertCircle } from 'lucide-react';
import { getCachedPoster, fetchPosterFromOpenSource } from '../utils/posterFallback';

interface SmartPosterProps {
  src?: string;
  alt: string;
  title: string;
  type?: 'movie' | 'tv' | string;
  year?: number | string;
  genres?: string[];
  className?: string;
  fallbackIconClass?: string;
  showTitleOnFallback?: boolean;
}

export const SmartPoster: React.FC<SmartPosterProps> = ({
  src,
  alt,
  title,
  type = 'movie',
  year,
  genres = [],
  className = 'w-full h-full object-cover',
  fallbackIconClass = 'w-8 h-8 text-slate-600',
  showTitleOnFallback = true
}) => {
  // Check if we already have an open-source cached replacement
  const initialCached = getCachedPoster(title);
  const [currentSrc, setCurrentSrc] = useState<string | null>(initialCached || src || null);
  const [hasError, setHasError] = useState(false);
  const [isFetchingFallback, setIsFetchingFallback] = useState(false);
  const [fallbackExhausted, setFallbackExhausted] = useState(false);

  useEffect(() => {
    const cached = getCachedPoster(title);
    if (cached) {
      setCurrentSrc(cached);
      setHasError(false);
      setFallbackExhausted(false);
    } else {
      setCurrentSrc(src || null);
      setHasError(!src);
      setFallbackExhausted(false);
    }
  }, [src, title]);

  const handleImageError = async () => {
    // If we haven't exhausted fallbacks, attempt open-source retrieval
    if (!fallbackExhausted && !isFetchingFallback) {
      setIsFetchingFallback(true);
      try {
        const mediaType: 'movie' | 'tv' = type === 'tv' ? 'tv' : 'movie';
        const fallbackUrl = await fetchPosterFromOpenSource(title, mediaType, year);
        if (fallbackUrl && fallbackUrl !== currentSrc) {
          setCurrentSrc(fallbackUrl);
          setHasError(false);
          setIsFetchingFallback(false);
          return;
        }
      } catch (err) {
        // Ignore and proceed to stylized card
      }
      setIsFetchingFallback(false);
      setFallbackExhausted(true);
      setHasError(true);
    } else {
      setHasError(true);
    }
  };

  // If no image is available or all network sources failed, show sleek visual poster card
  if (hasError && fallbackExhausted) {
    return (
      <div className="w-full h-full min-h-[140px] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-between p-3.5 text-center select-none border border-slate-800/60 relative overflow-hidden">
        {/* Subtle decorative background graphic */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        {/* Top badge */}
        <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 z-10">
          <span className="uppercase px-1 rounded bg-slate-800/80 text-slate-400">
            {type === 'tv' ? 'Series' : 'Movie'}
          </span>
          {year && <span>{year}</span>}
        </div>

        {/* Center Icon */}
        <div className="my-auto z-10 flex flex-col items-center gap-2">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 shadow-inner">
            {type === 'tv' ? (
              <Tv className={fallbackIconClass} />
            ) : (
              <Film className={fallbackIconClass} />
            )}
          </div>
          {showTitleOnFallback && (
            <span className="text-xs font-bold text-slate-300 line-clamp-2 px-1 max-w-[140px]">
              {title}
            </span>
          )}
        </div>

        {/* Bottom Genre tags */}
        {genres && genres.length > 0 && (
          <div className="text-[9px] font-medium text-slate-400 z-10 truncate w-full">
            {genres.slice(0, 2).join(' • ')}
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={currentSrc || ''}
      alt={alt || title}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={handleImageError}
      className={`${className} transition-opacity duration-300`}
    />
  );
};
