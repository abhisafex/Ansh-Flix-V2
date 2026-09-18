import React, { useState } from 'react';
import { 
  Server, 
  Zap, 
  Globe, 
  Sparkles, 
  Check, 
  Layers, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { PROVIDERS } from '../data/providers';
import { Provider } from '../types';

interface ServerSelectorProps {
  currentProvider: Provider;
  onSelectProvider: (provider: Provider) => void;
  mediaType: 'movie' | 'tv';
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  currentProvider,
  onSelectProvider,
  mediaType
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'primary' | 'multilang' | 'alternative'>('all');

  const supportedProviders = PROVIDERS.filter(p => p.supportedMedia.includes(mediaType));

  const filteredProviders = activeCategory === 'all' 
    ? supportedProviders 
    : supportedProviders.filter(p => {
        if (activeCategory === 'multilang') return p.category === 'multilang' || p.category === 'international';
        return p.category === activeCategory;
      });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-white">
            Server Switcher ({supportedProviders.length} Providers Available)
          </h4>
        </div>
        <span className="text-[11px] text-slate-400">
          If current server buffers or fails, switch to another server below:
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Servers ({supportedProviders.length})
        </button>
        <button
          onClick={() => setActiveCategory('primary')}
          className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            activeCategory === 'primary'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3 h-3 text-amber-400" />
          Primary & 4K
        </button>
        <button
          onClick={() => setActiveCategory('multilang')}
          className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            activeCategory === 'multilang'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3 h-3 text-emerald-400" />
          Hindi & Multi-Lang
        </button>
        <button
          onClick={() => setActiveCategory('alternative')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            activeCategory === 'alternative'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Alternative & Mirrors
        </button>
      </div>

      {/* Server Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
        {filteredProviders.map((provider, idx) => {
          const isSelected = provider.id === currentProvider.id;
          return (
            <button
              key={`${provider.id}-${idx}`}
              onClick={() => onSelectProvider(provider)}
              className={`text-left p-2.5 rounded-lg border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs'
                  : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-semibold truncate text-white">
                  {provider.name}
                </span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span className="font-mono px-1 py-0.5 rounded bg-slate-900/80 text-slate-300">
                  {provider.quality}
                </span>
                <span className="truncate text-slate-400 max-w-[80px]">
                  {provider.domain}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current server info footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium">Active Server:</span>
          <span className="text-white font-semibold">{currentProvider.name}</span>
          <span className="text-slate-500">({currentProvider.domain})</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">Resolution: <strong className="text-slate-200">{currentProvider.quality}</strong></span>
          <span className="text-slate-400">ID Format: <strong className="text-slate-200 uppercase">{currentProvider.idType}</strong></span>
        </div>
      </div>
    </div>
  );
};
