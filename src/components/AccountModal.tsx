import React, { useState } from 'react';
import { 
  X, 
  User, 
  LogOut, 
  Sliders, 
  Clock, 
  Bookmark, 
  Play, 
  Trash2, 
  Server, 
  Sparkles, 
  Check, 
  Film, 
  Tv 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PROVIDERS } from '../data/providers';
import { MediaItem } from '../types';

interface AccountModalProps {
  onSelectMedia?: (item: MediaItem) => void;
  onPlayEpisode?: (item: MediaItem, season: number, episode: number) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ onSelectMedia, onPlayEpisode }) => {
  const { 
    user, 
    isAccountModalOpen, 
    setIsAccountModalOpen, 
    logout, 
    updatePreferences, 
    removeContinueWatching,
    clearAllContinueWatching
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'continue' | 'watchlist' | 'preferences'>('continue');
  const [savedToast, setSavedToast] = useState(false);

  if (!isAccountModalOpen || !user) return null;

  const handlePreferenceChange = async (key: string, val: any) => {
    await updatePreferences({ [key]: val });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleResume = (item: any) => {
    setIsAccountModalOpen(false);
    const mediaObj: MediaItem = {
      id: item.mediaId,
      title: item.title,
      type: item.type,
      year: item.year || new Date().getFullYear(),
      poster: item.poster || '',
      backdrop: item.backdrop || '',
      overview: `Resuming ${item.title}`
    };

    if (item.type === 'tv' && item.season && item.episode && onPlayEpisode) {
      onPlayEpisode(mediaObj, item.season, item.episode);
    } else if (onSelectMedia) {
      onSelectMedia(mediaObj);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-rose-600/30">
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>My Account</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono">
                  PIN Active
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/20 hover:text-rose-400 text-slate-300 text-xs font-semibold border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
              title="Logout from device"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={() => setIsAccountModalOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('continue')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'continue'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Continue Watching ({user.continueWatching.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preferences'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {savedToast && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Preferences saved to your account!</span>
            </div>
          )}

          {/* 1. Continue Watching Tab */}
          {activeTab === 'continue' && (
            <div className="space-y-3">
              {user.continueWatching.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="font-semibold text-slate-400">No playback history yet</p>
                  <p className="mt-1">When you play any movie or series, it will automatically appear here.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {user.continueWatching.length} item{user.continueWatching.length > 1 ? 's' : ''} in watch history
                    </span>
                    <button
                      onClick={() => clearAllContinueWatching()}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold cursor-pointer hover:underline"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All History</span>
                    </button>
                  </div>
                  {user.continueWatching.map((item) => (
                    <div
                      key={`${item.mediaId}-${item.season || 0}-${item.episode || 0}`}
                      className="p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 group transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.poster ? (
                          <img
                            src={item.poster}
                            alt={item.title}
                            className="w-10 h-14 object-cover rounded-lg shrink-0 border border-slate-800"
                          />
                        ) : (
                          <div className="w-10 h-14 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                            {item.type === 'tv' ? <Tv className="w-4 h-4 text-slate-400" /> : <Film className="w-4 h-4 text-slate-400" />}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-rose-400 transition-colors">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            <span className="uppercase font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {item.type}
                            </span>
                            {item.type === 'tv' && item.season && item.episode && (
                              <span className="text-sky-400 font-bold font-mono">
                                S{item.season}:E{item.episode}
                              </span>
                            )}
                            <span className="text-slate-500">• {new Date(item.watchedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleResume(item)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-sm shadow-rose-600/30"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Resume</span>
                        </button>
                        <button
                          onClick={() => removeContinueWatching(item.mediaId)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Remove from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-4 text-xs">
              {/* Auto Play */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Auto-Play Next Episode</span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    Automatically loads the next episode when watching TV series.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePreferenceChange('autoPlay', !user.preferences.autoPlay)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    user.preferences.autoPlay ? 'bg-sky-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      user.preferences.autoPlay ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Default Server */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-semibold text-white text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Default Streaming Engine</span>
                </div>
                <p className="text-slate-400">
                  Select your preferred default server when opening any stream:
                </p>
                <select
                  value={user.preferences.defaultServerId || 'vidlink'}
                  onChange={(e) => handlePreferenceChange('defaultServerId', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.id === 'vidlink' ? '(Default Auto-Play)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preferred Language */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-semibold text-white text-sm">
                  Preferred Audio / Region
                </div>
                <select
                  value={user.preferences.preferredLanguage || 'hi'}
                  onChange={(e) => handlePreferenceChange('preferredLanguage', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="hi">Hindi / Bollywood Audio</option>
                  <option value="en">English (Original Audio)</option>
                  <option value="ko">Korean (K-Drama)</option>
                  <option value="ja">Japanese (Anime)</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
