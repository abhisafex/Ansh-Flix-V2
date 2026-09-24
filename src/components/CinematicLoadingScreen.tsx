import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Server, Zap, ShieldCheck } from 'lucide-react';
import { Provider, MediaItem } from '../types';

interface CinematicLoadingScreenProps {
  media: MediaItem;
  provider: Provider;
  season?: number;
  episode?: number;
  isStreamReady: boolean;
  onFinished?: () => void;
}

const LOADING_MESSAGES = [
  'Establishing secure ultra-low latency connection...',
  'Connecting to CDN stream cluster...',
  'Bypassing third-party advertising gates...',
  'Decrypting high-bitrate video stream...',
  'Synchronizing multi-language audio & subtitles...',
  'Stream synchronized! Launching playback...'
];

export const CinematicLoadingScreen: React.FC<CinematicLoadingScreenProps> = ({
  media,
  provider,
  season,
  episode,
  isStreamReady,
  onFinished
}) => {
  const [progress, setProgress] = useState(15);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Smooth progress bar simulation & message cycle
  useEffect(() => {
    let currentProg = 15;
    const interval = setInterval(() => {
      if (isStreamReady) {
        currentProg = 100;
        setProgress(100);
        setMessageIndex(LOADING_MESSAGES.length - 1);
        clearInterval(interval);
      } else {
        currentProg += Math.floor(Math.random() * 14) + 6;
        if (currentProg > 92) currentProg = 92; // hold at 92 until stream triggers ready
        setProgress(currentProg);

        const nextMsg = Math.min(
          Math.floor((currentProg / 95) * (LOADING_MESSAGES.length - 1)),
          LOADING_MESSAGES.length - 2
        );
        setMessageIndex(nextMsg);
      }
    }, 220);

    return () => clearInterval(interval);
  }, [isStreamReady]);

  // Handle stream ready trigger or auto timeout
  useEffect(() => {
    if (isStreamReady) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const finishTimer = setTimeout(() => {
          setIsVisible(false);
          if (onFinished) onFinished();
        }, 650);
        return () => clearTimeout(finishTimer);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isStreamReady, onFinished]);

  // Fallback safety timeout (auto fade out after 6 seconds if iframe onload was blocked by sandbox)
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsFadingOut(true);
      const finishTimer = setTimeout(() => {
        setIsVisible(false);
        if (onFinished) onFinished();
      }, 650);
      return () => clearTimeout(finishTimer);
    }, 6000);

    return () => clearTimeout(safetyTimer);
  }, [onFinished]);

  const handleManualSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onFinished) onFinished();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`absolute inset-0 z-40 bg-[#060810] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-out select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Ambient Glowing Red Radial Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-gradient-to-br from-rose-600/25 via-red-600/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] sm:w-[320px] h-[220px] sm:h-[320px] bg-red-600/20 rounded-full blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.12)_0%,rgba(6,8,16,0.95)_75%)]" />
      </div>

      {/* Media Backdrop Tint (Subtle Preview) */}
      {media.backdrop && (
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img
            src={media.backdrop}
            alt=""
            className="w-full h-full object-cover filter blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-[#060810]/80 to-[#060810]" />
        </div>
      )}

      {/* Main Cinematic Centerpiece */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md sm:max-w-lg w-full space-y-5">
        
        {/* Glowing Brand Icon & Wordmark */}
        <div className="relative flex flex-col items-center group">
          {/* Neon Icon Halo */}
          <div className="relative mb-3">
            <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 animate-pulse transition-opacity" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-500 via-rose-600 to-red-700 flex items-center justify-center text-white shadow-2xl border border-red-400/40">
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5 drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            </div>
          </div>

          {/* "ANSH'S FLIX" Red Glowing Signature Brand Text */}
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wider uppercase font-sans">
              <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">ANSH'S </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-red-600 font-extrabold drop-shadow-[0_0_25px_rgba(244,63,94,0.9)] animate-pulse">
                FLIX
              </span>
            </h1>
            <div className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.25em] text-red-400/90 uppercase mt-0.5 drop-shadow">
              ULTRA 4K STREAM ENGINE
            </div>
          </div>
        </div>

        {/* Media Details Pill */}
        <div className="flex flex-col items-center gap-1.5 pt-1">
          <div className="flex items-center gap-2 max-w-full px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-md backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-[280px]">
              {media.title}
            </span>
            {media.type === 'tv' && season && episode && (
              <span className="px-1.5 py-0.5 rounded bg-red-600/30 text-red-300 text-[10px] font-mono font-bold border border-red-500/40">
                S{season}:E{episode}
              </span>
            )}
          </div>

          {/* Active Server Badge */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <Server className="w-3 h-3 text-rose-400" />
            <span>Server: <strong className="text-rose-300">{provider.name}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-bold">{provider.quality}</span>
          </div>
        </div>

        {/* Signature Red Shimmer Progress Bar */}
        <div className="w-full space-y-2 pt-2">
          <div className="relative w-full h-2.5 sm:h-3 rounded-full bg-slate-900/90 border border-red-500/30 overflow-hidden shadow-inner p-0.5">
            {/* Red Gradient Glow Fill */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-700 via-rose-500 to-amber-400 transition-all duration-300 ease-out relative overflow-hidden shadow-[0_0_15px_rgba(244,63,94,0.8)]"
              style={{ width: `${progress}%` }}
            >
              {/* Sweeping Shimmer Beam Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.4s_infinite]" />
            </div>
          </div>

          {/* Progress Percent & Live Status Step */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono">
            <span className="text-slate-300 truncate max-w-[80%] text-left flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {LOADING_MESSAGES[messageIndex]}
            </span>
            <span className="text-rose-400 font-bold tracking-tight">
              {progress}%
            </span>
          </div>
        </div>

        {/* Skip / Jump to Stream Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleManualSkip}
            className="text-[11px] text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Skip Intro</span>
            <span className="text-rose-400 font-bold">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
