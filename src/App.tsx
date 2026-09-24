import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Film, 
  PlayCircle, 
  Server, 
  KeyRound, 
  Activity, 
  Shield, 
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import { MediaItem } from './types';
import { SAMPLE_MEDIA } from './data/sampleMedia';
import { Navbar } from './components/Navbar';
import { CatalogView, CATEGORIES, GENRE_OPTIONS, LANGUAGE_OPTIONS } from './components/CatalogView';
import { WatchPlayer } from './components/WatchPlayer';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { StreamUrlGenerator } from './components/StreamUrlGenerator';
import { ProviderRegistry } from './components/ProviderRegistry';
import { ScraperDeepDive } from './components/ScraperDeepDive';
import { NetworkInspector } from './components/NetworkInspector';
import { MobileFilterDrawer } from './components/MobileFilterDrawer';
import { AuthModal } from './components/AuthModal';
import { AccountModal } from './components/AccountModal';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'player' | 'generator' | 'providers' | 'decryption' | 'architecture' | 'network'>('browse');
  const [activeCategory, setActiveCategory] = useState<string>('trending');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem>(SAMPLE_MEDIA[0]);
  const [tmdbConfigured, setTmdbConfigured] = useState<boolean>(false);
  const [targetSeason, setTargetSeason] = useState<number | undefined>(undefined);
  const [targetEpisode, setTargetEpisode] = useState<number | undefined>(undefined);

  // Mobile Drawer & Filter states
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Check TMDB status from backend
  useEffect(() => {
    fetch('/api/tmdb/status')
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data && data.configured) {
          setTmdbConfigured(true);
        }
      })
      .catch(() => {
        // Fallback gracefully to curated mode
        setTmdbConfigured(false);
      });
  }, []);

  const handleSelectMedia = (item: MediaItem) => {
    setSelectedMedia(item);
    setTargetSeason(undefined);
    setTargetEpisode(undefined);
    setActiveTab('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayEpisode = (item: MediaItem, season: number, episode: number) => {
    setSelectedMedia(item);
    setTargetSeason(season);
    setTargetEpisode(episode);
    setActiveTab('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category: string) => {
    setActiveCategory(category);
    setActiveTab('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchInCatalog = (query: string) => {
    setSearchQuery(query);
    setActiveCategory('all');
    setActiveTab('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchSandbox = (url: string, title: string) => {
    // If user clicks a link in the generator, we can set media or play
    setActiveTab('player');
  };

  return (
    <div className="min-h-screen bg-[#141414] text-zinc-100 flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      {/* Top Navigation - Clean Netflix Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          handleSelectCategory(cat);
          setMobileDrawerOpen(false);
        }}
        tmdbConfigured={tmdbConfigured}
        selectedTitle={selectedMedia.title}
        onSelectMedia={handleSelectMedia}
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        onSearchInCatalog={handleSearchInCatalog}
      />

      {/* Main Content Viewport */}
      <main className={`flex-1 w-full mx-auto ${activeTab === 'player' ? 'max-w-7xl px-2 sm:px-4 py-2' : 'max-w-7xl px-3 sm:px-6 lg:px-8 py-6'}`}>
        {activeTab === 'browse' && (
          <CatalogView
            onSelectMedia={handleSelectMedia}
            tmdbLiveConfigured={tmdbConfigured}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            selectedGenre={selectedGenre}
            onGenreChange={setSelectedGenre}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
          />
        )}

        {activeTab === 'player' && (
          <WatchPlayer
            media={selectedMedia}
            onSelectMedia={handleSelectMedia}
            onBackToBrowse={() => setActiveTab('browse')}
            initialSeason={targetSeason}
            initialEpisode={targetEpisode}
          />
        )}

        {activeTab === 'generator' && (
          <StreamUrlGenerator onSelectForSandbox={handleLaunchSandbox} />
        )}

        {activeTab === 'providers' && (
          <ProviderRegistry />
        )}

        {activeTab === 'decryption' && (
          <ScraperDeepDive />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureDiagram />
        )}

        {activeTab === 'network' && (
          <NetworkInspector />
        )}
      </main>

      {/* Ansh's Flix v1 Clean Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-10 mt-auto text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 via-rose-600 to-sky-500 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-rose-600/30">
                ▶
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white tracking-tight">
                  Remix Ansh's <span className="text-rose-500">Flix</span>
                </span>
                <span className="text-[9px] uppercase font-mono px-1 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                  v2
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
                • Multi-Server Free HD/4K Multi-Language Cinema
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-slate-400 text-xs font-medium">
              <button onClick={() => handleSelectCategory('trending')} className="hover:text-white transition-colors cursor-pointer">
                Home
              </button>
              <button onClick={() => handleSelectCategory('new_releases')} className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1">
                <span>✨ New Releases</span>
              </button>
              <button onClick={() => handleSelectCategory('popular_movies')} className="hover:text-white transition-colors cursor-pointer">
                Movies
              </button>
              <button onClick={() => handleSelectCategory('popular_tv')} className="hover:text-white transition-colors cursor-pointer">
                TV Shows
              </button>
              <button onClick={() => handleSelectCategory('hindi')} className="hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1">
                <span>🇮🇳 Bollywood</span>
              </button>
              <button onClick={() => handleSelectCategory('korean')} className="hover:text-rose-400 transition-colors cursor-pointer">
                K-Drama
              </button>
              <button onClick={() => handleSelectCategory('anime')} className="hover:text-white transition-colors cursor-pointer">
                Anime
              </button>
              <button onClick={() => handleSelectCategory('top_rated_movies')} className="hover:text-white transition-colors cursor-pointer">
                4K UHD
              </button>
              <button onClick={() => setActiveTab('providers')} className="hover:text-rose-400 transition-colors cursor-pointer">
                20+ Resolvers
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>
              Remix Ansh's Flix v2 does not host any media files on its servers. All videos and stream endpoints are resolved via decentralized third-party providers and public APIs.
            </p>
            <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400 shrink-0">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">AdBlock Protected</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Multi-Language</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">AES-256 HLS</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile 3-Bar Slide-over Drawer for Filters & Categories */}
      <MobileFilterDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        categories={CATEGORIES.filter(c => c.id !== 'watchlist' || isLoggedIn)}
        selectedCategory={activeCategory}
        onSelectCategory={(cat) => {
          handleSelectCategory(cat);
          setMobileDrawerOpen(false);
        }}
        genres={GENRE_OPTIONS}
        selectedGenre={selectedGenre}
        onSelectGenre={(g) => {
          setSelectedGenre(g);
          setActiveTab('browse');
        }}
        languages={LANGUAGE_OPTIONS}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={(l) => {
          setSelectedLanguage(l);
          setActiveTab('browse');
        }}
        selectedType={selectedType}
        onSelectType={(t) => {
          setSelectedType(t);
          setActiveTab('browse');
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setActiveTab('browse');
        }}
        onResetFilters={() => {
          setActiveCategory('trending');
          setSelectedGenre('all');
          setSelectedLanguage('all');
          setSelectedType('all');
          setSearchQuery('');
        }}
      />

      {/* User Auth Modal (Email OTP + 4-Digit PIN) */}
      <AuthModal />

      {/* User Account & Preferences Modal */}
      <AccountModal
        onSelectMedia={handleSelectMedia}
        onPlayEpisode={handlePlayEpisode}
      />
    </div>
  );
}
