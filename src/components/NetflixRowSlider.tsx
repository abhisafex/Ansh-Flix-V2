import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface NetflixRowSliderProps {
  items: MediaItem[];
  onSelectMedia: (item: MediaItem) => void;
  watchlist: number[];
  onToggleBookmark: (item: MediaItem) => void;
  shelfKey: string;
}

export const NetflixRowSlider: React.FC<NetflixRowSliderProps> = ({
  items,
  onSelectMedia,
  watchlist,
  onToggleBookmark,
  shelfKey
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollPosition = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  useEffect(() => {
    checkScrollPosition();
    const handleResize = () => checkScrollPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [items]);

  const slide = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const container = rowRef.current;
    const scrollAmount = container.clientWidth * 0.82; // Scroll ~5-6 items per slide
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkScrollPosition, 350);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group/slider -mx-4 px-4 sm:-mx-6 sm:px-6">
      {/* Left Netflix Slide Button */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => slide('left')}
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/80 hover:bg-rose-600 text-white border border-white/20 shadow-2xl flex items-center justify-center backdrop-blur-md opacity-0 group-hover/slider:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
          aria-label="Slide Left"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Netflix Horizontal Row Slider */}
      <div
        ref={rowRef}
        onScroll={checkScrollPosition}
        className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth no-scrollbar py-2 px-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, idx) => (
          <div
            key={`${shelfKey}-${item.id}-${idx}`}
            className="shrink-0 w-[44vw] xs:w-[38vw] sm:w-[28vw] md:w-[22vw] lg:w-[15.8%] snap-start"
          >
            <MediaCard
              item={item}
              onSelect={onSelectMedia}
              isBookmarked={watchlist.includes(item.id)}
              onToggleBookmark={onToggleBookmark}
            />
          </div>
        ))}
      </div>

      {/* Right Netflix Slide Button */}
      {showRightArrow && items.length > 5 && (
        <button
          type="button"
          onClick={() => slide('right')}
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/80 hover:bg-rose-600 text-white border border-white/20 shadow-2xl flex items-center justify-center backdrop-blur-md opacity-0 group-hover/slider:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
          aria-label="Slide Right"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}
    </div>
  );
};
