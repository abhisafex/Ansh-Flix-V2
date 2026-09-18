import React, { useState } from 'react';
import { 
  Play, 
  Copy, 
  Check, 
  ExternalLink, 
  SlidersHorizontal, 
  Tv, 
  Film, 
  Sparkles, 
  Code2,
  Info
} from 'lucide-react';
import { SAMPLE_MEDIA } from '../data/sampleMedia';
import { PROVIDERS } from '../data/providers';
import { MediaItem, Provider } from '../types';

interface StreamUrlGeneratorProps {
  onSelectForSandbox?: (url: string, title: string) => void;
}

export const StreamUrlGenerator: React.FC<StreamUrlGeneratorProps> = ({ onSelectForSandbox }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem>(SAMPLE_MEDIA[0]);
  const [customId, setCustomId] = useState<string>('');
  const [customImdb, setCustomImdb] = useState<string>('');
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);
  const [selectedProvider, setSelectedProvider] = useState<Provider>(PROVIDERS[0]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'matrix'>('single');

  const effectiveId = customId.trim() !== '' ? parseInt(customId, 10) || selectedMedia.id : selectedMedia.id;
  const effectiveImdb = customImdb.trim() !== '' ? customImdb.trim() : (selectedMedia.imdbId || 'tt1375666');

  // Helper to build real URL for a given provider
  const buildStreamUrl = (provider: Provider): string => {
    const isTv = selectedMedia.type === 'tv';
    const id = provider.idType === 'imdb' ? effectiveImdb : effectiveId;

    if (provider.id === 'vidlink') {
      const base = isTv 
        ? `${provider.url}/tv/${id}/${season}/${episode}`
        : `${provider.url}/movie/${id}`;
      return `${base}${provider.extraParams || ''}`;
    }

    if (provider.id === 'videasy') {
      return isTv 
        ? `${provider.url}/tv/${id}/${season}/${episode}`
        : `${provider.url}/movie/${id}`;
    }

    if (provider.id === 'vidplus') {
      const base = isTv 
        ? `${provider.url}/embed/tv/${id}/${season}/${episode}`
        : `${provider.url}/embed/movie/${id}`;
      return `${base}${provider.extraParams || ''}`;
    }

    if (provider.id === 'vidplus2') {
      return isTv 
        ? `${provider.url}/embed/tv/${id}/${season}/${episode}`
        : `${provider.url}/embed/movie/${id}?autoplay=true`;
    }

    if (provider.id === 'vidfast') {
      return isTv 
        ? `${provider.url}/tv/${id}/${season}/${episode}?autoplay=true`
        : `${provider.url}/movie/${id}?autoplay=true`;
    }

    if (provider.id === 'vixsrc') {
      return isTv 
        ? `${provider.url}/tv/${id}/${season}/${episode}`
        : `${provider.url}/movie/${id}`;
    }

    if (provider.id.startsWith('nxsha')) {
      let langParam = 'lang=en';
      if (provider.id.includes('hindi')) langParam = 'lang=hindi';
      if (provider.id.includes('spanish')) langParam = 'lang=es&sub=es';
      return isTv 
        ? `${provider.url}/embed/tv/${id}/${season}/${episode}?${langParam}&autoplay=true`
        : `${provider.url}/embed/movie/${id}?${langParam}&autoplay=true`;
    }

    if (provider.id === 'primesrc') {
      return isTv 
        ? `${provider.url}/embed/tv?tmdb=${effectiveId}&season=${season}&episode=${episode}`
        : `${provider.url}/embed/movie?imdb=${effectiveImdb}`;
    }

    if (provider.id === 'twoembed') {
      return isTv 
        ? `${provider.url}/embed/tv/${id}/${season}/${episode}`
        : `${provider.url}/embed/movie/${id}`;
    }

    if (provider.id === 'vidking') {
      return isTv 
        ? `${provider.url}/embed/tv/${id}/${season}/${episode}?autoplay=true&episodeSelector=true`
        : `${provider.url}/embed/movie/${id}?autoplay=true`;
    }

    if (provider.id === 'cinemaos') {
      return isTv 
        ? `${provider.url}/player/${id}/${season}/${episode}`
        : `${provider.url}/player/${id}`;
    }

    if (provider.id === 'frembed') {
      return isTv 
        ? `${provider.url}/api/serie.php?id=${id}&sa=${season}&epi=${episode}`
        : `${provider.url}/api/film.php?id=${id}`;
    }

    if (provider.id === 'rivestream') {
      return isTv 
        ? `${provider.url}/embed?type=tv&id=${id}&season=${season}&episode=${episode}`
        : `${provider.url}/embed?type=movie&id=${id}`;
    }

    // Default standard template fallback
    return isTv 
      ? `${provider.url}/embed/tv/${id}/${season}/${episode}`
      : `${provider.url}/embed/movie/${id}`;
  };

  const currentUrl = buildStreamUrl(selectedProvider);
  const iframeCode = `<iframe \n  src="${currentUrl}" \n  width="100%" \n  height="100%" \n  frameborder="0" \n  scrolling="no" \n  allowfullscreen \n  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"\n></iframe>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Live Stream Link & Embed URL Generator
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select any movie/series or enter a custom TMDB ID to view how Ansh's Flix v1 generates the exact embed URLs for 30+ providers.
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'single' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Single Inspector
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'matrix' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All 20+ Providers Matrix
            </button>
          </div>
        </div>

        {/* Media Selector Strip */}
        <div className="pt-5 space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quick Select Preset Titles
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SAMPLE_MEDIA.map((media) => {
              const isSelected = selectedMedia.id === media.id && customId === '';
              return (
                <button
                  key={media.id}
                  onClick={() => {
                    setSelectedMedia(media);
                    setCustomId('');
                    setCustomImdb('');
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500/20' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium uppercase bg-white border border-slate-200 text-slate-600">
                      {media.type}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {media.year}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                    {media.title}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    TMDB: {media.id}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom ID Overrides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Custom TMDB ID
              </label>
              <input
                type="number"
                placeholder={`Current: ${selectedMedia.id}`}
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                IMDb ID (For Primesrc)
              </label>
              <input
                type="text"
                placeholder={selectedMedia.imdbId || 'e.g. tt1375666'}
                value={customImdb}
                onChange={(e) => setCustomImdb(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {selectedMedia.type === 'tv' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Season Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={season}
                    onChange={(e) => setSeason(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Episode Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={episode}
                    onChange={(e) => setEpisode(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Provider Selection */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Choose Embed Server ({PROVIDERS.length} Discovered)
              </h4>
              <span className="text-[11px] text-slate-400">watch-v2 cluster</span>
            </div>

            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {PROVIDERS.map((provider, idx) => {
                const isSelected = selectedProvider.id === provider.id;
                return (
                  <button
                    key={`${provider.id}-${idx}`}
                    onClick={() => setSelectedProvider(provider)}
                    className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-500 text-blue-950 font-medium' 
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200">
                        {provider.countryCode}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          {provider.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {provider.domain}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                        {provider.quality}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Generated URL & Code Output */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Active Resolver: {selectedProvider.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Target: {selectedMedia.title} {selectedMedia.type === 'tv' ? `(S${season}E${episode})` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onSelectForSandbox && (
                  <button
                    onClick={() => onSelectForSandbox(currentUrl, `${selectedMedia.title} (${selectedProvider.name})`)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Open in Safe Sandbox
                  </button>
                )}
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* URL Output */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Exact Generated Embed Stream URL</span>
                <button
                  onClick={() => copyToClipboard(currentUrl)}
                  className="text-blue-600 hover:text-blue-800 text-[11px] flex items-center gap-1"
                >
                  {copiedUrl === currentUrl ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg border border-slate-800 break-all select-all">
                {currentUrl}
              </div>
            </div>

            {/* Iframe Code */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-slate-500" />
                  Embedded HTML Iframe Code (as placed in DOM)
                </span>
                <button
                  onClick={() => copyToClipboard(iframeCode)}
                  className="text-blue-600 hover:text-blue-800 text-[11px] flex items-center gap-1"
                >
                  {copiedUrl === iframeCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Iframe</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 bg-slate-900 text-slate-200 font-mono text-xs rounded-lg border border-slate-800 overflow-x-auto leading-relaxed">
                {iframeCode}
              </pre>
            </div>

            {/* Provider Technical Breakdown */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Technical Specification: {selectedProvider.name}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400">ID Type:</span>{' '}
                  <span className="font-mono font-medium text-slate-800 uppercase">{selectedProvider.idType}</span>
                </div>
                <div>
                  <span className="text-slate-400">Format Template:</span>{' '}
                  <span className="font-mono text-slate-800">{selectedProvider.urlFormat}</span>
                </div>
                <div>
                  <span className="text-slate-400">Max Quality:</span>{' '}
                  <span className="font-medium text-slate-800">{selectedProvider.quality}</span>
                </div>
                <div>
                  <span className="text-slate-400">Category:</span>{' '}
                  <span className="font-medium capitalize text-slate-800">{selectedProvider.category}</span>
                </div>
              </div>
              <div className="pt-2 text-xs text-slate-500 border-t border-slate-200">
                <strong>Reverse-Engineering Notes:</strong> {selectedProvider.notes}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Matrix View: Comparison of all providers */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              All 20+ Endpoints for: {selectedMedia.title} (ID: {effectiveId})
            </h4>
            <span className="text-xs text-slate-500">
              AutoEmbed switches between these when a server fails
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 font-semibold">
                  <th className="p-3">Server Name</th>
                  <th className="p-3">Region</th>
                  <th className="p-3">ID Type</th>
                  <th className="p-3">Generated Live Embed URL</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {PROVIDERS.map((prov, idx) => {
                  const url = buildStreamUrl(prov);
                  return (
                    <tr key={`${prov.id}-${idx}`} className="hover:bg-slate-50">
                      <td className="p-3 font-sans font-medium text-slate-900 whitespace-nowrap">
                        {prov.name}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">
                          {prov.countryCode}
                        </span>
                      </td>
                      <td className="p-3 uppercase text-slate-500 whitespace-nowrap">
                        {prov.idType}
                      </td>
                      <td className="p-3 text-slate-600 truncate max-w-md" title={url}>
                        {url}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap font-sans">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyToClipboard(url)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-600"
                            title="Copy URL"
                          >
                            {copiedUrl === url ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {onSelectForSandbox && (
                            <button
                              onClick={() => onSelectForSandbox(url, `${selectedMedia.title} (${prov.name})`)}
                              className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-medium"
                            >
                              Sandbox
                            </button>
                          )}
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 hover:bg-slate-200 rounded text-slate-600"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
