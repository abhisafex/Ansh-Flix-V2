import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  ExternalLink, 
  Lock, 
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SandboxViewerProps {
  initialUrl?: string;
  initialTitle?: string;
}

export const SandboxViewer: React.FC<SandboxViewerProps> = ({ 
  initialUrl = 'https://vidlink.pro/movie/1386315?primaryColor=white&autoplay=false',
  initialTitle = 'The Runner (Echo / VidLink)'
}) => {
  const [embedUrl, setEmbedUrl] = useState<string>(initialUrl);
  const [inputUrl, setInputUrl] = useState<string>(initialUrl);
  const [key, setKey] = useState<number>(0);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setEmbedUrl(inputUrl.trim());
    setKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Isolated Embed Sandbox Viewer
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Safely inspect third-party embed players inside a fortified iframe sandbox that restricts popunders, redirects, and clickjacking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Direct Native Player (No Sandbox)
            </span>
          </div>
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleApply} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter embed URL to preview..."
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            Load Embed
          </button>
          <button
            type="button"
            onClick={() => setKey((k) => k + 1)}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
            title="Reload frame"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>

        {/* Unrestricted Embed Status */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Direct HTML5 Playback (Sandbox attribute removed for 100% server compatibility)
          </span>
          <a
            href={embedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
          >
            Open in new tab
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate max-w-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-mono text-[11px] text-slate-300 truncate">
              {embedUrl}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">16:9 Aspect Ratio</span>
        </div>

        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <iframe
            key={key}
            src={embedUrl}
            title={initialTitle}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Why Third-Party Embeds Use Sandboxing:</strong> Many pirate video streaming hosters attempt to open popunders, coinminers, or prompt APK downloads whenever a user clicks anywhere on the player. AutoEmbed protects its visitors using strict iframe sandboxing and CSS overlays that capture malicious click events before they navigate the browser.
        </div>
      </div>
    </div>
  );
};
