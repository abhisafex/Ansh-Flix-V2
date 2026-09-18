import React, { useState } from 'react';
import { 
  Globe, 
  Database, 
  Layers, 
  Server, 
  PlaySquare, 
  ShieldCheck, 
  FileCode, 
  Cpu, 
  ArrowRight,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { ArchitectureNode } from '../types';

const ARCHITECTURE_STEPS: ArchitectureNode[] = [
  {
    id: 'frontend',
    title: '1. Frontend Portal (watch-v2.autoembed.app)',
    subtitle: 'Next.js 14/15 App Router + Tailwind CSS',
    category: 'frontend',
    description: 'The user visits the frontend site. It acts purely as a content catalog and media discovery interface. It serves server-rendered React components and does NOT store or host any media files.',
    techStack: ['Next.js (App Router)', 'React 19', 'Tailwind CSS', 'Cloudflare CDN'],
    role: 'Presents UI, routes /movie/[id] and /tv/[id], tracks watched state, and embeds iframe players.',
    codeSnippet: `// Client layout snippet extracted from watch-v2.autoembed.app:
const onPlayClick = async (e) => {
  e.preventDefault();
  await saveWatchState({ type: "movie", id: movieId });
  window.location.href = "/watch/movie";
};`
  },
  {
    id: 'tmdb',
    title: '2. Metadata Engine (The Movie Database API)',
    subtitle: 'api.themoviedb.org & image.tmdb.org',
    category: 'metadata',
    description: 'AutoEmbed queries TMDB for all titles, plot overviews, release years, cast members, high-resolution backdrops, and poster URLs. Every movie and series is identified by its official TMDB ID (e.g., Inception = 27205).',
    techStack: ['TMDB v3 REST API', 'Cloudflare Image Cache'],
    role: 'Provides catalog taxonomy, search index, and universal ID mappings.',
    codeSnippet: `// Example metadata query
GET https://api.themoviedb.org/3/movie/1386315?api_key=...
Response:
{
  "id": 1386315,
  "title": "The Runner",
  "poster_path": "/uTWhbLc7Bj4qNSdW3ZvZKL8cOHv.jpg",
  "genres": [{"id": 28, "name": "Action"}],
  "vote_average": 6.5
}`
  },
  {
    id: 'embed_layer',
    title: '3. Embed Provider Router (The Switchboard)',
    subtitle: 'Dynamic Server Selection & Fallbacks',
    category: 'embed_layer',
    description: 'Inside the video page, AutoEmbed does not call a video file. Instead, it renders an <iframe> targeting one of 30+ embed provider endpoints using template interpolation like {provider_url}/movie/{tmdb_id}.',
    techStack: ['HTML5 Iframe', 'URL Template Formatter', 'Provider Fallback Table'],
    role: 'Abstracts streaming complexity into embed iframes and handles server switching.',
    codeSnippet: `// Extracted provider template table in autoembed:
const PROVIDERS = [
  { name: "Echo", url: "https://vidlink.pro/movie/" },
  { name: "4K", url: "https://player.videasy.to/movie/" },
  { name: "Premium", url: "https://player.vidplus.pro/embed/movie/" },
  { name: "Nxsha", url: "https://nxsha.space/embed/movie/" }
];
// Generated Iframe
<iframe src="https://vidlink.pro/movie/1386315?autoplay=true" allowfullscreen />`
  },
  {
    id: 'resolver',
    title: '4. Upstream Scrapers & Decryptors (Behind the Embed)',
    subtitle: 'VidLink, Videasy, Nxsha, VidPlus backend',
    category: 'resolver',
    description: 'When the iframe loads, the embed service executes a backend scraper. It queries file hosters/cyberlockers with the TMDB ID to locate files, decrypts rotating keys (AES-256-CBC, XOR tokens, WASM), and extracts HLS playlists.',
    techStack: ['Node.js Scrapers', 'AES Decryption', 'WASM De-obfuscation', 'CORS Proxies'],
    role: 'Cracks Cyberlocker anti-scraping protections and derives master .m3u8 URLs.',
    codeSnippet: `// Scraper AES Decryption sample:
const encryptedSource = await fetch('https://megacloud.tv/embed-2/ajax/e-1/getSources?id=...');
const rawJson = await encryptedSource.json();
// Unscrambles encrypted token using current rotating cipher key
const decrypted = crypto.subtle.decrypt(
  { name: 'AES-CBC', iv: extractedIV },
  secretKey,
  rawJson.sources
);
// Yields direct HLS manifest: https://.../master.m3u8`
  },
  {
    id: 'hoster',
    title: '5. Cyberlockers & Storage CDNs',
    subtitle: 'RabbitStream, MegaCloud, UpCloud, StreamWish',
    category: 'hoster',
    description: 'Unlicensed offshore video storage servers that actually hold the physical gigabytes of video. They slice videos into 10-second .ts chunks or fragmented MP4s, served over high-bandwidth content delivery networks.',
    techStack: ['HLS (HTTP Live Streaming)', 'Nginx Video Streaming', 'Akamai / Cloudflare Edge'],
    role: 'Stores actual video files, transcodes multi-resolution bitrates, and streams chunks.',
    codeSnippet: `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=4500000,RESOLUTION=1920x1080
1080p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2200000,RESOLUTION=1280x720
720p/index.m3u8`
  },
  {
    id: 'client',
    title: '6. Embedded Video Player (In Browser)',
    subtitle: 'HLS.js / Plyr / Video.js inside Iframe',
    category: 'client',
    description: 'Inside the iframe on the user\'s screen, an HLS.js client downloads the .m3u8 master playlist, automatically adjusts resolution based on network speed, requests .ts chunks via CORS proxies, and displays playback controls.',
    techStack: ['HLS.js', 'HTML5 Video API', 'WebVTT Subtitles', 'Plyr UI'],
    role: 'Renders video pixels, manages audio tracks, and coordinates subtitle overlays.',
    codeSnippet: `const hls = new Hls({ xhrSetup: (xhr) => { /* bypass referrer */ } });
hls.loadSource('https://cdn.provider.net/hls/master.m3u8');
hls.attachMedia(videoElement);`
  }
];

export const ArchitectureDiagram: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(ARCHITECTURE_STEPS[0]);

  const getNodeIcon = (category: ArchitectureNode['category']) => {
    switch (category) {
      case 'frontend': return <Globe className="w-5 h-5 text-sky-600" />;
      case 'metadata': return <Database className="w-5 h-5 text-emerald-600" />;
      case 'embed_layer': return <Layers className="w-5 h-5 text-indigo-600" />;
      case 'resolver': return <Cpu className="w-5 h-5 text-amber-600" />;
      case 'hoster': return <Server className="w-5 h-5 text-rose-600" />;
      case 'client': return <PlaySquare className="w-5 h-5 text-violet-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top explainer card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-700 mt-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
              The Architecture Behind AutoEmbed (watch-v2.autoembed.app)
            </h2>
            <p className="mt-1 text-slate-600 text-sm leading-relaxed max-w-3xl">
              Websites like <span className="font-mono text-slate-800 bg-slate-200 px-1 py-0.5 rounded text-xs">watch-v2.autoembed.app</span> do 
              <strong> not</strong> host or store any video files on their servers. Instead, they operate as a multi-tier proxy pipeline: 
              combining <strong>TMDB metadata</strong>, a <strong>Next.js client interface</strong>, and over <strong>30+ third-party embed resolvers</strong> that 
              scrape and decrypt direct HLS video streams from underground cyberlockers.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          End-to-End Streaming Request Pipeline (Click any step to inspect)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 relative">
          {ARCHITECTURE_STEPS.map((step, idx) => {
            const isSelected = selectedNode.id === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setSelectedNode(step)}
                className={`p-3 text-left rounded-lg transition-all border relative flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500/20' 
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded-md bg-white border border-slate-200 shadow-xs">
                      {getNodeIcon(step.category)}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-slate-500">
                      0{idx + 1}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                    {step.title.split('. ')[1] || step.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {step.subtitle}
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-blue-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Node Inspector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 mb-5 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
              {getNodeIcon(selectedNode.category)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{selectedNode.title}</h3>
              <p className="text-xs text-slate-500 font-mono">{selectedNode.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedNode.techStack.map((tech) => (
              <span 
                key={tech}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                How It Works
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="text-xs font-semibold text-slate-800 mb-1">Primary Responsibility</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedNode.role}</p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <FileCode className="w-4 h-4 text-slate-500" />
                Under the Hood: Real Code Extract
              </span>
              <span className="text-[11px] text-slate-400">Syntax: JavaScript/JSON/HLS</span>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
              {selectedNode.codeSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
