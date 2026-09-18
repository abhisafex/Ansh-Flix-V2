import React, { useState } from 'react';
import { 
  Key, 
  Unlock, 
  FileText, 
  ShieldAlert, 
  Cpu, 
  Code, 
  Terminal, 
  Copy, 
  Check,
  Zap
} from 'lucide-react';

export const ScraperDeepDive: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleAesCode = `// 1. Fetching the encrypted video source
const resp = await fetch('https://megacloud.tv/embed-2/ajax/e-1/getSources?id=' + videoId, {
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://megacloud.tv/'
  }
});
const { sources: encryptedString } = await resp.json();

// 2. Extracting dynamic key indices (RabbitStream / MegaCloud approach)
// The host obfuscates indices inside an external JS script or WebAssembly module
const decryptedKey = await getRotatingKey(); 

// 3. AES-256-CBC Decryption
const decipher = crypto.createDecipheriv('aes-256-cbc', decryptedKey.key, decryptedKey.iv);
let decrypted = decipher.update(encryptedString, 'base64', 'utf8');
decrypted += decipher.final('utf8');

// 4. Returns direct HLS stream link
const streamData = JSON.parse(decrypted);
console.log(streamData[0].file); 
// Output: "https://.../master.m3u8"`;

  const sampleM3u8 = `#EXTM3U
#EXT-X-VERSION:4
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-1",NAME="English",DEFAULT=YES,URI="audio/en/prog_index.m3u8"
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",DEFAULT=YES,URI="subs/en.vtt"
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="Spanish",DEFAULT=NO,URI="subs/es.vtt"

#EXT-X-STREAM-INF:BANDWIDTH=5800000,AVERAGE-BANDWIDTH=5200000,RESOLUTION=1920x1080,FRAME-RATE=23.976,AUDIO="audio-1",SUBTITLES="subs"
1080p/manifest.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3100000,AVERAGE-BANDWIDTH=2800000,RESOLUTION=1280x720,FRAME-RATE=23.976,AUDIO="audio-1",SUBTITLES="subs"
720p/manifest.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1400000,AVERAGE-BANDWIDTH=1200000,RESOLUTION=842x480,FRAME-RATE=23.976,AUDIO="audio-1",SUBTITLES="subs"
480p/manifest.m3u8`;

  const sampleProxyCode = `// How Embed Providers bypass CORS & Anti-Hotlinking
// Browsers block direct requests to cyberlocker .m3u8 files due to Referer headers
app.get('/api/proxy/hls', async (req, res) => {
  const targetUrl = req.query.url;
  
  const videoStream = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': 'https://megacloud.tv/', // Spoof expected hoster referer
      'Origin': 'https://megacloud.tv'
    }
  });

  // Inject wide open CORS headers for the client video player
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  
  // Rewrites nested .ts chunk paths so chunks also route through proxy
  const playlistText = await videoStream.text();
  const rewritten = rewriteChunkUrls(playlistText, '/api/proxy/segment?url=');
  res.send(rewritten);
});`;

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-lg text-amber-700 mt-1">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              The Scraper & Decryption Mechanics
            </h3>
            <p className="mt-1 text-slate-600 text-sm leading-relaxed max-w-3xl">
              Ever wondered how an embed provider like <strong>VidLink</strong> or <strong>VidPlus</strong> turns a simple TMDB ID like 
              <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs mx-1 font-mono">1386315</code> into a playable 1080p stream? 
              Here is the exact reverse-engineered cryptographic and networking breakdown.
            </p>
          </div>
        </div>
      </div>

      {/* Step by Step Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-600 mb-1">
              <span>PHASE 01</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900">
              TMDB-to-File Search Mapping
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              The provider maintains an indexed database or live scraper that maps TMDB IDs to internal video files hosted on cyberlockers (RabbitStream, MegaCloud, UpCloud). 
              If the movie is new, the scraper queries locker search APIs using the title and release year.
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-700">
            TMDB 1386315 &rarr; Locker Hash ID: <span className="text-blue-600">e-1/x9fK32m</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-600 mb-1">
              <span>PHASE 02</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900">
              Encrypted Payload Retrieval
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              Cyberlockers do not return raw video URLs. When you call their <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">/getSources</code> endpoint, 
              they return an obfuscated Base64 string encrypted with symmetric AES or XOR keys that change every 6 to 24 hours.
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-700 truncate">
            {`{"sources": "U2FsdGVkX1+...=="}`}
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-600 mb-1">
              <span>PHASE 03</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900">
              CORS Bypass & HLS Delivery
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              The extracted <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">.m3u8</code> playlist references media segments protected by HTTP Referer checks. 
              The embed provider sets up reverse proxies to rewrite segment paths and strip anti-hotlinking headers.
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-700">
            HLS.js player streams <span className="text-emerald-600">.ts chunks</span> smoothly.
          </div>
        </div>
      </div>

      {/* Code Blocks Breakdown */}
      <div className="space-y-6">
        {/* AES Decryption Block */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Unlock className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-semibold text-slate-900">
                1. Reverse Engineering the AES Decryption Routine
              </h4>
            </div>
            <button
              onClick={() => copySnippet('aes', sampleAesCode)}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              {copiedKey === 'aes' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-slate-200 font-mono text-xs rounded-lg border border-slate-800 overflow-x-auto leading-relaxed">
            {sampleAesCode}
          </pre>
        </div>

        {/* M3U8 Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-slate-900">
                2. Inside the Extracted HLS Master Playlist (.m3u8)
              </h4>
            </div>
            <button
              onClick={() => copySnippet('m3u8', sampleM3u8)}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              {copiedKey === 'm3u8' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy HLS</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            This is what the video player actually reads. Notice the adaptive bitrate streams (1080p, 720p, 480p) and separate audio & subtitle tracks:
          </p>
          <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg border border-slate-800 overflow-x-auto leading-relaxed">
            {sampleM3u8}
          </pre>
        </div>

        {/* CORS Proxy Block */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-600" />
              <h4 className="text-sm font-semibold text-slate-900">
                3. The CORS Bypass & Anti-Hotlinking Proxy Layer
              </h4>
            </div>
            <button
              onClick={() => copySnippet('proxy', sampleProxyCode)}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              {copiedKey === 'proxy' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-sky-300 font-mono text-xs rounded-lg border border-slate-800 overflow-x-auto leading-relaxed">
            {sampleProxyCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
