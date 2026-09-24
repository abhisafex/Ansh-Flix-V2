import React from 'react';
import { Play } from 'lucide-react';

interface NetflixLoadingScreenProps {
  title: string;
  season?: number;
  episode?: number;
  isTv?: boolean;
  serverName: string;
  isLoading: boolean;
}

export const NetflixLoadingScreen: React.FC<NetflixLoadingScreenProps> = ({
  title,
  season,
  episode,
  isTv,
  serverName,
  isLoading
}) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-300">
      {/* Radial red glow backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.18)_0%,transparent_70%)] pointer-events-none" />

      {/* Cinematic Netflix Brand Logo Animation */}
      <div className="relative flex flex-col items-center space-y-5 z-10">
        {/* Animated Play icon with glowing ring */}
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#E50914] via-[#B81D24] to-[#141414] p-0.5 shadow-[0_0_40px_rgba(229,9,20,0.6)] animate-pulse">
            <div className="w-full h-full bg-[#141414] rounded-2xl flex items-center justify-center">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-[#E50914] text-[#E50914] translate-x-0.5" />
            </div>
          </div>
        </div>

        {/* Netflix Iconic Bold Logo Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(229,9,20,0.8)]">
            ANSH'S <span className="text-[#E50914]">FLIX</span>
          </h1>
          <p className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-zinc-400">
            {isTv && season && episode ? (
              <span className="text-zinc-200">
                {title} • <span className="text-[#E50914]">S{season}:E{episode}</span>
              </span>
            ) : (
              <span className="text-zinc-200">{title}</span>
            )}
          </p>
        </div>

        {/* Netflix Signature Red Shimmer Progress Line */}
        <div className="w-44 sm:w-60 h-1 bg-zinc-900 rounded-full overflow-hidden relative shadow-inner">
          <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#E50914] to-transparent rounded-full animate-[shimmer_1.4s_infinite_linear]" />
        </div>

        {/* Server & Quality Status */}
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-zinc-400 bg-zinc-950/80 px-3 py-1 rounded-full border border-zinc-800">
          <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
          <span>Connecting to <strong className="text-white">{serverName}</strong></span>
          <span className="text-zinc-600">•</span>
          <span className="text-emerald-400 font-bold">4K Ultra HD</span>
        </div>
      </div>
    </div>
  );
};
