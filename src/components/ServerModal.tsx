import React, { useState } from 'react';
import { 
  Server, 
  Zap, 
  Globe, 
  Check, 
  X, 
  ShieldCheck, 
  AlertTriangle,
  Play,
  Sparkles
} from 'lucide-react';
import { PROVIDERS } from '../data/providers';
import { Provider } from '../types';

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProvider: Provider;
  onSelectProvider: (provider: Provider) => void;
  mediaType: 'movie' | 'tv';
  isFailurePrompt?: boolean;
}

export const ServerModal: React.FC<ServerModalProps> = ({
  isOpen,
  onClose,
  currentProvider,
  onSelectProvider,
  mediaType,
  isFailurePrompt = false
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'primary' | 'multilang' | 'fast'>('all');

  if (!isOpen) return null;

  const supportedProviders = PROVIDERS.filter(p => p.supportedMedia.includes(mediaType));

  const filteredProviders = supportedProviders.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'primary') return p.category === 'primary';
    if (activeTab === 'multilang') return p.category === 'multilang' || p.category === 'international';
    if (activeTab === 'fast') return p.category === 'alternative' || p.category === 'primary';
    return true;
  });

  const handleSelect = (p: Provider) => {
    onSelectProvider(p);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-950/60">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${isFailurePrompt ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'}`}>
              {isFailurePrompt ? <AlertTriangle className="w-5 h-5" /> : <Server className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {isFailurePrompt ? 'Videasy 4K Issue? Choose Another Server' : 'Choose Streaming Server'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFailurePrompt 
                  ? 'Videasy 4K is our default server. If it failed to load or is buffering, select any alternative server below:' 
                  : 'Select an alternate server if current playback is slow or unavailable:'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'all' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Servers ({supportedProviders.length})
          </button>
          <button
            onClick={() => setActiveTab('primary')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'primary' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            4K & Primary Fast
          </button>
          <button
            onClick={() => setActiveTab('multilang')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'multilang' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            Hindi & Multi-Lang
          </button>
          <button
            onClick={() => setActiveTab('fast')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fast' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            Fast CDN Mirrors
          </button>
        </div>

        {/* Server Cards List */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2 max-h-[58vh]">
          {filteredProviders.map((p, idx) => {
            const isCurrent = p.id === currentProvider.id;

            return (
              <div
                key={p.id}
                onClick={() => handleSelect(p)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent 
                    ? 'bg-rose-500/10 border-rose-500/50 text-white ring-1 ring-rose-500/30' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCurrent ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-white truncate">
                        {p.name}
                      </span>

                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {p.quality}
                      </span>

                      {p.id === 'videasy' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {p.notes || (p.specialFeatures && p.specialFeatures.join(' • '))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCurrent ? (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      Switch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All servers run with direct web embed protection</span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
