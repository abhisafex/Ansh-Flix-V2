import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Tv, 
  Film, 
  Star, 
  Clock, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Bookmark, 
  BookmarkCheck, 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Share2,
  Info,
  Sparkles,
  Zap,
  Loader2,
  Server,
  AlertTriangle
} from 'lucide-react';
import { MediaItem, Provider } from '../types';
import { PROVIDERS } from '../data/providers';
import { SAMPLE_MEDIA } from '../data/sampleMedia';
import { buildStreamUrl } from '../utils/streamUrl';
import { NetflixEpisodesList } from './NetflixEpisodesList';
import { SmartPoster } from './SmartPoster';
import { ServerModal } from './ServerModal';
import { CinematicLoadingScreen } from './CinematicLoadingScreen';
import { useAuth } from '../context/AuthContext';
import { 
  sendPlaySignalsToIframe, 
  simulateCenterClick, 
  subscribePopupBlocked,
  setPopupShieldEnabled 
} from '../utils/popupShield';

interface WatchPlayerProps {
  media: MediaItem;
  onSelectMedia: (item: MediaItem) => void;
  onBackToBrowse: () => void;
  initialSeason?: number;
  initialEpisode?: number;
}

export const WatchPlayer: React.FC<WatchPlayerProps> = ({
  media,
  onSelectMedia,
  onBackToBrowse,
  initialSeason,
  initialEpisode
}) => {
  const { 
    user, 
    addContinueWatching, 
    toggleWatchlist: authToggleWatchlist, 
    isInWatchlist 
  } = useAuth();

  // VidLink is the default primary streaming engine for instant autoplay & zero popups, or user's saved preference
  const defaultProviderId = user?.preferences?.defaultServerId || 'vidlink';
  const initialProvider = PROVIDERS.find(p => p.id === defaultProviderId) || PROVIDERS.find(p => p.id === 'vidlink') || PROVIDERS[0];

  const [selectedProvider, setSelectedProvider] = useState<Provider>(initialProvider);
  const [showServerModal, setShowServerModal] = useState<boolean>(false);
  const [isFailurePrompt, setIsFailurePrompt] = useState<boolean>(false);
  const [loadTimeoutTriggered, setLoadTimeoutTriggered] = useState<boolean>(false);
  const [switchToast, setSwitchToast] = useState<string | null>(null);
  const [reloadClickCount, setReloadClickCount] = useState<number>(0);

  const [currentSeason, setCurrentSeason] = useState<number>(initialSeason || 1);
  const [currentEpisode, setCurrentEpisode] = useState<number>(initialEpisode || 1);
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => isInWatchlist(media.id));

  // Cinematic Loading Screen states
  const [showCinematicLoader, setShowCinematicLoader] = useState<boolean>(true);
  const [isStreamReady, setIsStreamReady] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Auto-play next episode option for series (persisted in user preferences or localStorage)
  const [autoPlay, setAutoPlay] = useState<boolean>(() => {
    if (user?.preferences?.autoPlay !== undefined) return user.preferences.autoPlay;
    try {
      const saved = localStorage.getItem('autostream_autoplay');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Auto-Click Play button state (automatically clicks & plays video on load)
  const [autoClickPlay, setAutoClickPlay] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('autostream_autoclick');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Popup & New Tab Blocker Shield state (blocks all unwanted popups & external tabs)
  const [popupShieldActive, setPopupShieldActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('autostream_popup_shield');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isAutoClicking, setIsAutoClicking] = useState<boolean>(false);
  const [autoClickSuccess, setAutoClickSuccess] = useState<boolean>(false);
  const [blockedPopupCount, setBlockedPopupCount] = useState<number>(0);
  const [popupBlockedToast, setPopupBlockedToast] = useState<string | null>(null);

  const toggleAutoPlay = () => {
    setAutoPlay(prev => {
      const nextVal = !prev;
      try {
        localStorage.setItem('autostream_autoplay', String(nextVal));
      } catch {}
      return nextVal;
    });
  };

  const toggleAutoClickPlay = () => {
    setAutoClickPlay(prev => {
      const nextVal = !prev;
      try {
        localStorage.setItem('autostream_autoclick', String(nextVal));
      } catch {}
      return nextVal;
    });
  };

  const togglePopupShield = () => {
    setPopupShieldActive(prev => {
      const nextVal = !prev;
      setPopupShieldEnabled(nextVal);
      try {
        localStorage.setItem('autostream_popup_shield', String(nextVal));
      } catch {}
      return nextVal;
    });
  };

  // Sync popup shield state on mount
  useEffect(() => {
    setPopupShieldEnabled(popupShieldActive);
  }, [popupShieldActive]);

  // Subscribe to popup blocker notifications
  useEffect(() => {
    const unsubscribe = subscribePopupBlocked((count) => {
      setBlockedPopupCount(count);
      setPopupBlockedToast('🛡️ Blocked 1 ad popup / new tab attempt');
      const timer = setTimeout(() => setPopupBlockedToast(null), 3500);
      return () => clearTimeout(timer);
    });
    return unsubscribe;
  }, []);

  // Universal Auto-Click on Play Button executor
  const executeAutoClickPlay = (initialDelay = 150) => {
    if (!autoClickPlay) return;

    setIsAutoClicking(true);
    setAutoClickSuccess(false);

    // Staggered sequence of synthetic clicks and postMessage signals to trigger playback
    const delays = [initialDelay, initialDelay + 400, initialDelay + 950, initialDelay + 1700, initialDelay + 2600];

    delays.forEach((delayTime, idx) => {
      setTimeout(() => {
        if (iframeRef.current) {
          sendPlaySignalsToIframe(iframeRef.current);
        }
        if (playerContainerRef.current) {
          simulateCenterClick(playerContainerRef.current);
        }

        if (idx === delays.length - 1) {
          setAutoClickSuccess(true);
          setTimeout(() => {
            setIsAutoClicking(false);
          }, 1500);
        }
      }, delayTime);
    });
  };

  const handleIframeLoad = () => {
    // When stream iframe finishes loading, complete progress and fade out cinematic loading screen
    setIsStreamReady(true);
    // When Videasy or any provider finishes loading, auto-click play button immediately
    executeAutoClickPlay(150);
  };

  // Auto-trigger cinematic loading whenever media, season, episode, or provider changes
  useEffect(() => {
    setShowCinematicLoader(true);
    setIsStreamReady(false);
    executeAutoClickPlay(300);
  }, [detailedMediaIdSafe(media.id), currentSeason, currentEpisode, selectedProvider.id, key]);

  // Failure / Timeout detection: If server has been waiting for stream for too long, show fallback prompt
  useEffect(() => {
    setLoadTimeoutTriggered(false);
    const timer = setTimeout(() => {
      setLoadTimeoutTriggered(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, [detailedMediaIdSafe(media.id), currentSeason, currentEpisode, key, selectedProvider.id]);

  function detailedMediaIdSafe(id: number) {
    return id;
  }

  const handleSelectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setKey(prev => prev + 1);
    setLoadTimeoutTriggered(false);
    setReloadClickCount(0);
    setSwitchToast(`Switched to ${provider.name} (${provider.quality})`);
    setTimeout(() => setSwitchToast(null), 4000);
  };

  // Live TMDB detailed media state & TV season episodes
  const [detailedMedia, setDetailedMedia] = useState<MediaItem>(media);
  const [seasonEpisodes, setSeasonEpisodes] = useState<any[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState<boolean>(false);

  // Reset & fetch fresh details when media changes
  useEffect(() => {
    setDetailedMedia(media);
    setCurrentSeason(1);
    setCurrentEpisode(1);

    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/tmdb/details/${media.type}/${media.id}`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const json = await res.json();
          if (json.data) {
            setDetailedMedia(prev => ({
              ...prev,
              ...json.data
            }));
            if (json.data.episodesList && json.data.episodesList.length > 0) {
              setSeasonEpisodes(json.data.episodesList);
            }
          }
        }
      } catch {
        // Handled silently - detailedMedia retains passed props
      }
    };

    fetchDetails();
  }, [media.id, media.type]);

  // Fetch season episodes for TV series when season changes
  useEffect(() => {
    if (detailedMedia.type !== 'tv') return;

    const fetchSeason = async () => {
      setIsLoadingEpisodes(true);
      try {
        const res = await fetch(`/api/tmdb/tv/${detailedMedia.id}/season/${currentSeason}`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const json = await res.json();
          if (json.episodes && json.episodes.length > 0) {
            setSeasonEpisodes(json.episodes);
          }
        }
      } catch {
        // Fall back gracefully
      } finally {
        setIsLoadingEpisodes(false);
      }
    };

    fetchSeason();
  }, [detailedMedia.id, detailedMedia.type, currentSeason]);

  // Check and sync watchlist in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('autostream_watchlist');
      if (saved) {
        const list: number[] = JSON.parse(saved);
        setIsBookmarked(list.includes(detailedMedia.id));
      }
    } catch {
      // ignore
    }
  }, [detailedMedia.id]);

  // Save to continue watching in user profile & local storage
  useEffect(() => {
    addContinueWatching({
      mediaId: detailedMedia.id,
      title: detailedMedia.title,
      poster: detailedMedia.poster,
      backdrop: detailedMedia.backdrop,
      type: detailedMedia.type,
      season: detailedMedia.type === 'tv' ? currentSeason : undefined,
      episode: detailedMedia.type === 'tv' ? currentEpisode : undefined,
      providerId: selectedProvider.id,
      watchedAt: Date.now()
    });
  }, [detailedMedia.id, currentSeason, currentEpisode, selectedProvider.id]);

  const toggleBookmark = () => {
    const newState = authToggleWatchlist(detailedMedia.id);
    setIsBookmarked(newState);
  };

  const streamUrl = buildStreamUrl(selectedProvider, detailedMedia, currentSeason, currentEpisode, autoPlay);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(streamUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    setKey((prev) => prev + 1);
    setReloadClickCount(prev => {
      const next = prev + 1;
      if (next >= 2 && selectedProvider.id === 'videasy') {
        setIsFailurePrompt(true);
        setShowServerModal(true);
      }
      return next;
    });
  };

  const isTv = detailedMedia.type === 'tv';
  const totalSeasons = detailedMedia.seasons || 1;
  const episodesCount = seasonEpisodes.length > 0 
    ? seasonEpisodes.length 
    : (detailedMedia.episodesPerSeason || (detailedMedia.episodesList ? detailedMedia.episodesList.length : 8));

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1);
    } else if (currentSeason > 1) {
      setCurrentSeason(currentSeason - 1);
      setCurrentEpisode(1);
    }
  };

  const handleNextEpisode = () => {
    if (currentEpisode < episodesCount) {
      setCurrentEpisode(currentEpisode + 1);
    } else if (currentSeason < totalSeasons) {
      setCurrentSeason(currentSeason + 1);
      setCurrentEpisode(1);
    }
  };

  // Memoized episodes list with full fallbacks (title, runtime, thumbnail, description)
  const computedEpisodes = React.useMemo(() => {
    if (seasonEpisodes.length > 0) return seasonEpisodes;
    if (detailedMedia.episodesList && detailedMedia.episodesList.length > 0) {
      const match = detailedMedia.episodesList.filter(e => e.season === currentSeason);
      if (match.length > 0) {
        return match.map(ep => ({
          ...ep,
          still: ep.still || detailedMedia.backdrop || detailedMedia.poster,
          overview: ep.overview || `Episode ${ep.episode} of ${detailedMedia.title} Season ${currentSeason}. Follow the gripping narrative as secrets and events unfold.`
        }));
      }
    }
    const count = detailedMedia.episodesPerSeason || 8;
    return Array.from({ length: count }, (_, i) => ({
      season: currentSeason,
      episode: i + 1,
      title: `Episode ${i + 1}`,
      runtime: '45m',
      still: detailedMedia.backdrop || detailedMedia.poster,
      overview: `Episode ${i + 1} of ${detailedMedia.title} Season ${currentSeason}. Follow the storyline as drama and tension escalate.`
    }));
  }, [seasonEpisodes, detailedMedia, currentSeason]);

  const recommendations = (detailedMedia.recommendations && detailedMedia.recommendations.length > 0)
    ? detailedMedia.recommendations
    : SAMPLE_MEDIA.filter(m => m.id !== detailedMedia.id).slice(0, 6);

  return (
    <div className={`space-y-2.5 sm:space-y-3 ${theaterMode ? 'max-w-full' : 'max-w-7xl mx-auto'}`}>
      {/* Toast Notification when server switched */}
      {switchToast && (
        <div className="p-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{switchToast}</span>
          </div>
          <button onClick={() => setSwitchToast(null)} className="text-emerald-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Toast Notification when popup or new tab is intercepted & blocked */}
      {popupBlockedToast && (
        <div className="p-2.5 px-4 rounded-xl bg-slate-900/95 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{popupBlockedToast}</span>
            <span className="text-[11px] text-slate-400 font-normal">
              (Total blocked: {blockedPopupCount})
            </span>
          </div>
          <button onClick={() => setPopupBlockedToast(null)} className="text-slate-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Top Streamlined Header Bar: Back, Title, and ONLY Change Server Option */}
      <div className="w-full flex items-center justify-between gap-2 p-1.5 sm:p-2 bg-slate-900/95 border border-slate-800 rounded-xl shadow-md text-xs">
        {/* Left: Navigation & Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <button
            onClick={onBackToBrowse}
            className="hover:text-white flex items-center gap-1 font-medium bg-slate-800 hover:bg-slate-700 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-200 transition-colors cursor-pointer shrink-0 active:scale-95"
            title="Return to Catalog"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Back</span>
          </button>

          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="text-slate-100 font-semibold truncate text-xs sm:text-sm">
              {detailedMedia.title}
            </span>

            {isTv && (
              <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700 font-mono text-[10px] sm:text-[11px] shrink-0 font-bold">
                S{currentSeason}:E{currentEpisode}
              </span>
            )}
          </div>
        </div>

        {/* Right: ONLY Server Switcher Button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsFailurePrompt(false);
              setShowServerModal(true);
            }}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-lg border text-xs font-semibold items-center gap-1.5 shrink-0 transition-all cursor-pointer flex bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25 active:scale-95 shadow-sm"
            title="Click to Choose Another Server"
          >
            <Server className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="text-white font-medium truncate max-w-[110px] xs:max-w-[140px] sm:max-w-none">
              {selectedProvider.name}
            </span>
            <span className="hidden sm:inline text-[10px] text-rose-300/80 font-normal">
              ({selectedProvider.quality})
            </span>
            <ChevronDown className="w-3 h-3 text-rose-400 shrink-0 opacity-80" />
          </button>
        </div>
      </div>

      {/* Adaptive Screen Size Player (Zero Scroll Guaranteed on Mobile & PC) */}
      <div className="w-full flex justify-center items-center">
        <div 
          ref={playerContainerRef}
          className="w-full relative rounded-xl sm:rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex flex-col transition-all"
          style={{
            maxWidth: theaterMode 
              ? '100%' 
              : isTv 
                ? 'min(100%, calc((100dvh - 190px) * (16 / 9)))' 
                : 'min(100%, calc((100dvh - 145px) * (16 / 9)))'
          }}
        >
          {/* Adaptive Video Player Screen: Sized responsively to viewport height on mobile & PC */}
          <div 
            className="relative w-full aspect-video bg-black flex items-center justify-center min-h-0"
            style={{
              maxHeight: theaterMode 
                ? 'calc(100dvh - 110px)' 
                : isTv 
                  ? 'calc(100dvh - 190px)' 
                  : 'calc(100dvh - 145px)'
            }}
          >
            <iframe
              ref={iframeRef}
              key={`${key}-${detailedMedia.id}-${currentSeason}-${currentEpisode}-${autoPlay}-${selectedProvider.id}`}
              src={streamUrl}
              title={`${detailedMedia.title} Stream`}
              className="w-full h-full border-0 absolute inset-0"
              onLoad={handleIframeLoad}
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope; clipboard-write; web-share"
              referrerPolicy="no-referrer"
            />

            {/* Cinematic Red Glowing Brand Loading Screen */}
            {showCinematicLoader && (
              <CinematicLoadingScreen
                key={`cinematic-loader-${key}-${detailedMedia.id}-${currentSeason}-${currentEpisode}-${selectedProvider.id}`}
                media={detailedMedia}
                provider={selectedProvider}
                season={isTv ? currentSeason : undefined}
                episode={isTv ? currentEpisode : undefined}
                isStreamReady={isStreamReady}
                onFinished={() => setShowCinematicLoader(false)}
              />
            )}

            {/* Smart Server Failure / Buffering Popup Alert */}
            {loadTimeoutTriggered && (
              <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-auto z-30 bg-slate-950/95 border border-amber-500/50 text-slate-200 p-2 sm:px-3 rounded-xl shadow-2xl flex items-center justify-between gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="text-[11px] sm:text-xs text-slate-200 font-medium">
                    Server taking too long or buffering?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsFailurePrompt(true);
                    setShowServerModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] transition-colors cursor-pointer shrink-0 shadow-sm shadow-rose-600/40"
                >
                  Switch Server
                </button>
                <button
                  type="button"
                  onClick={() => setLoadTimeoutTriggered(false)}
                  className="text-slate-400 hover:text-white p-0.5 text-base leading-none cursor-pointer"
                  title="Dismiss"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          {/* TV Episode Next/Prev & AutoPlay Controller Bar (Directly attached under player) */}
          {isTv && (
            <div className="bg-slate-900/95 border-t border-slate-800 p-2 sm:p-2.5 px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={handlePrevEpisode}
                  disabled={currentSeason === 1 && currentEpisode === 1}
                  className="px-2 sm:px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Previous Episode"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Previous Ep</span>
                  <span className="sm:hidden">Prev</span>
                </button>

                <button
                  onClick={handleNextEpisode}
                  disabled={currentSeason === totalSeasons && currentEpisode === episodesCount}
                  className="px-2 sm:px-3 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:hover:bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-sm shadow-rose-600/30"
                  title="Next Episode"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <span className="text-slate-300 font-medium text-xs hidden md:inline ml-1">
                  Season {currentSeason}, Episode {currentEpisode} of {episodesCount}
                </span>
              </div>

              {/* Center/Right: Episode Selector & Auto Play indicator */}
              <div className="flex items-center gap-1.5 min-w-0">
                <select
                  value={currentEpisode}
                  onChange={(e) => setCurrentEpisode(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-500 max-w-[130px] xs:max-w-[200px] sm:max-w-[260px] truncate"
                >
                  {computedEpisodes.map((ep: any) => (
                    <option key={ep.episode} value={ep.episode}>
                      Ep {ep.episode}: {ep.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={toggleAutoPlay}
                  className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                    autoPlay
                      ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title="Auto Play Next Episode"
                >
                  <Sparkles className={`w-3 h-3 ${autoPlay ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>Auto-Next: {autoPlay ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Netflix-Style TV Seasons & Episodes Browser */}
      {isTv && (
        <NetflixEpisodesList
          media={detailedMedia}
          currentSeason={currentSeason}
          currentEpisode={currentEpisode}
          episodes={computedEpisodes}
          isLoading={isLoadingEpisodes}
          onSelectSeason={(s) => {
            setCurrentSeason(s);
            setCurrentEpisode(1);
          }}
          onSelectEpisode={(ep) => {
            setCurrentEpisode(ep);
          }}
        />
      )}

      {/* Media Details & Synopsis */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row gap-6">
          <SmartPoster
            src={detailedMedia.poster}
            alt={detailedMedia.title}
            title={detailedMedia.title}
            type={detailedMedia.type}
            year={detailedMedia.year}
            genres={detailedMedia.genres}
            className="w-36 sm:w-44 rounded-lg shadow-md border border-slate-800 object-cover shrink-0 mx-auto md:mx-0"
          />

          <div className="space-y-3 flex-1">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {detailedMedia.type}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedProvider.quality}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {detailedMedia.year}
                </span>
                {detailedMedia.duration && (
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {detailedMedia.duration}
                  </span>
                )}
                {detailedMedia.rating && (
                  <span className="text-xs text-amber-400 flex items-center gap-1 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {detailedMedia.rating} / 10
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {detailedMedia.title}
              </h2>
              {detailedMedia.tagline && (
                <p className="text-xs italic text-blue-300/80 mt-0.5">
                  "{detailedMedia.tagline}"
                </p>
              )}
            </div>

            {detailedMedia.genres && (
              <div className="flex flex-wrap gap-1.5">
                {detailedMedia.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {detailedMedia.overview}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400 font-mono border-t border-slate-800/80">
              <div>
                <span className="text-slate-500">TMDB ID: </span>
                <span className="text-slate-200">{detailedMedia.id}</span>
              </div>
              {detailedMedia.imdbId && (
                <div>
                  <span className="text-slate-500">IMDb ID: </span>
                  <span className="text-slate-200">{detailedMedia.imdbId}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500">Stream Source: </span>
                <span className="text-emerald-400 font-semibold">{selectedProvider.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Up Next / Recommended Titles */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          More Titles to Stream
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {recommendations.map((item) => (
            <div
              key={`${item.id}-${item.type}`}
              onClick={() => onSelectMedia(item)}
              className="group cursor-pointer bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-blue-500/60 transition-all hover:scale-[1.02] shadow-md flex flex-col"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-slate-950">
                <SmartPoster
                  src={item.poster}
                  alt={item.title}
                  title={item.title}
                  type={item.type}
                  year={item.year}
                  genres={item.genres}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  showTitleOnFallback={false}
                />
                <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  {item.rating || '7.5'}
                </div>
              </div>
              <div className="p-2 flex-1 flex flex-col justify-between">
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 truncate">
                  {item.title}
                </h4>
                <span className="text-[10px] text-slate-400 mt-1 font-mono uppercase">
                  {item.type} • {item.year}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Server Selection & Fallback Modal */}
      <ServerModal
        isOpen={showServerModal}
        onClose={() => {
          setShowServerModal(false);
          setIsFailurePrompt(false);
        }}
        currentProvider={selectedProvider}
        onSelectProvider={handleSelectProvider}
        mediaType={detailedMedia.type}
        isFailurePrompt={isFailurePrompt}
      />
    </div>
  );
};
