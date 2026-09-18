import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Server, 
  ShieldAlert, 
  ExternalLink, 
  Zap, 
  Globe2, 
  Film, 
  Radio
} from 'lucide-react';
import { PROVIDERS, HOSTERS } from '../data/providers';
import { Provider } from '../types';

export const ProviderRegistry: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');

  const filteredProviders = PROVIDERS.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.domain.toLowerCase().includes(search.toLowerCase()) ||
      p.notes?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesQuality = qualityFilter === 'all' || p.quality === qualityFilter;

    return matchesSearch && matchesCat && matchesQuality;
  });

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              Discovered Provider & Resolver Registry
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Extracted directly from <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">watch-v2.autoembed.app</span> client webpack chunks (<span className="font-mono text-slate-700">common-70a0a5b2d72e4f97.js</span>).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
              {PROVIDERS.length} Active Resolvers Cataloged
            </span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, domain, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="primary">Primary Resolvers</option>
              <option value="alternative">Alternative Fallbacks</option>
              <option value="multilang">Multi-Language & Dubbed</option>
              <option value="international">International / Regional</option>
            </select>
          </div>

          <div>
            <select
              value={qualityFilter}
              onChange={(e) => setQualityFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Quality Profiles</option>
              <option value="4K">4K UHD</option>
              <option value="1080p">1080p Full HD</option>
              <option value="720p">720p HD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Provider Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map((provider, idx) => (
          <div
            key={`${provider.id}-${idx}`}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-800">
                    {provider.countryCode}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                      {provider.name}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      {provider.domain}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  provider.quality === '4K' 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {provider.quality}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 mb-4">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Category</span>
                  <span className="capitalize font-medium text-slate-800">{provider.category}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Identifier Type</span>
                  <span className="uppercase font-mono font-medium text-slate-800">{provider.idType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Media</span>
                  <span className="font-medium text-slate-800">
                    {provider.supportedMedia.join(', ')}
                  </span>
                </div>
              </div>

              {/* Special Features Badges */}
              <div className="flex flex-wrap gap-1 mb-4">
                {provider.specialFeatures.map((feat) => (
                  <span
                    key={feat}
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {provider.notes}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Upstream Storage Hosters Section */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <Radio className="w-5 h-5 text-rose-400" />
          <h3 className="text-base font-semibold">
            Upstream Cyberlockers & Storage Hosters (Where the actual videos sit)
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-6 max-w-3xl leading-relaxed">
          The embed providers listed above do not store videos either. They run server-side scrapers that extract direct HLS (.m3u8) streams from these primary file lockers:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HOSTERS.map((hoster) => (
            <div key={hoster.name} className="p-4 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">{hoster.name}</h4>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {hoster.role}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <p>
                  <strong className="text-slate-400">Extraction Mechanism:</strong> {hoster.mechanism}
                </p>
                <p>
                  <strong className="text-slate-400">Stream Output:</strong> {hoster.output}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
