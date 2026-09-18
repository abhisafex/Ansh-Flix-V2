import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  ArrowDownRight, 
  FileCode2,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { NetworkRequestItem } from '../types';

const SIMULATED_REQUESTS: NetworkRequestItem[] = [
  {
    id: 'req-1',
    url: 'https://watch-v2.autoembed.app/movie/1386315',
    method: 'GET',
    status: 200,
    type: 'document',
    size: '42.8 KB',
    time: '85 ms',
    initiator: 'Browser Navigation',
    roleDescription: 'Initial HTML document from Next.js App Router containing React RSC flight data and page skeleton.',
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'server': 'cloudflare',
      'cf-ray': 'a35e0559e9054a98-NRT',
      'cache-control': 'public, max-age=0, must-revalidate'
    },
    responsePreview: '<!DOCTYPE html><html><head><title>The Runner | Auto embed</title>...<script>self.__next_f.push(...)</script>'
  },
  {
    id: 'req-2',
    url: 'https://api.themoviedb.org/3/movie/1386315?append_to_response=credits,similar',
    method: 'GET',
    status: 200,
    type: 'xhr',
    size: '14.2 KB',
    time: '120 ms',
    initiator: 'Next.js Server Component (Fetch Cache)',
    roleDescription: 'Retrieves movie details, poster path, overview, genres, and cast metadata from TMDB.',
    headers: {
      'content-type': 'application/json;charset=utf-8',
      'x-memc': 'HIT',
      'vary': 'Accept-Encoding'
    },
    responsePreview: '{"id": 1386315, "title": "The Runner", "poster_path": "/uTWhbLc7Bj4qNSdW3ZvZKL8cOHv.jpg", "vote_average": 6.5}'
  },
  {
    id: 'req-3',
    url: 'https://image.tmdb.org/t/p/original/uTWhbLc7Bj4qNSdW3ZvZKL8cOHv.jpg',
    method: 'GET',
    status: 200,
    type: 'image',
    size: '480 KB',
    time: '64 ms',
    initiator: 'Next.js Image Optimizer (next/image)',
    roleDescription: 'Downloads backdrop and high-resolution movie poster to display on the hero section.',
    headers: {
      'content-type': 'image/jpeg',
      'cache-control': 'public, max-age=31536000'
    }
  },
  {
    id: 'req-4',
    url: 'https://vidlink.pro/movie/1386315?primaryColor=white&autoplay=true',
    method: 'GET',
    status: 200,
    type: 'document',
    size: '18.4 KB',
    time: '145 ms',
    initiator: 'HTMLIFrameElement (watch-v2 player container)',
    roleDescription: 'Loads the chosen third-party embed player iframe inside the watch page container.',
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-frame-options': 'ALLOW-FROM https://watch-v2.autoembed.app',
      'access-control-allow-origin': '*'
    },
    responsePreview: '<!DOCTYPE html><div id="player"></div><script src="https://vidlink.pro/player.min.js"></script>'
  },
  {
    id: 'req-5',
    url: 'https://vidlink.pro/api/sources/tmdb/1386315',
    method: 'POST',
    status: 200,
    type: 'xhr',
    size: '2.1 KB',
    time: '210 ms',
    initiator: 'player.min.js (Iframe Client)',
    roleDescription: 'Queries the VidLink resolver API to locate active video streams and subtitles for this TMDB ID.',
    headers: {
      'content-type': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
      'authorization': 'Bearer session_token_tmp92'
    },
    responsePreview: '{"success": true, "stream": "https://stream.vidlink.pro/hls/master.m3u8?token=xyz", "subtitles": [{"lang": "en", "url": "https://vidlink.pro/subs/1386315_en.vtt"}]}'
  },
  {
    id: 'req-6',
    url: 'https://stream.vidlink.pro/hls/master.m3u8?token=xyz',
    method: 'GET',
    status: 200,
    type: 'media',
    size: '1.2 KB',
    time: '95 ms',
    initiator: 'hls.js (Video Stream Engine)',
    roleDescription: 'Downloads HLS master manifest containing adaptive quality variants (1080p, 720p, 480p).',
    headers: {
      'content-type': 'application/vnd.apple.mpegurl',
      'access-control-allow-origin': '*'
    },
    responsePreview: '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=4800000,RESOLUTION=1920x1080\n1080p.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=1280x720\n720p.m3u8'
  },
  {
    id: 'req-7',
    url: 'https://cdn.hoster-edge.net/seg/1080p/chunk_0001.ts',
    method: 'GET',
    status: 200,
    type: 'media',
    size: '1.8 MB',
    time: '180 ms',
    initiator: 'hls.js Chunk Loader',
    roleDescription: 'Streaming video chunk playback begins. Video plays seamlessly in the player.',
    headers: {
      'content-type': 'video/mp2t',
      'accept-ranges': 'bytes',
      'access-control-allow-origin': '*'
    }
  }
];

export const NetworkInspector: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(SIMULATED_REQUESTS.length);
  const [selectedReq, setSelectedReq] = useState<NetworkRequestItem>(SIMULATED_REQUESTS[0]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const startSimulation = () => {
    setIsRunning(true);
    setActiveStep(1);
    setSelectedReq(SIMULATED_REQUESTS[0]);

    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step <= SIMULATED_REQUESTS.length) {
        setActiveStep(step);
        setSelectedReq(SIMULATED_REQUESTS[step - 1]);
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 800);
  };

  const visibleRequests = SIMULATED_REQUESTS.slice(0, activeStep);

  const getTypeBadge = (type: NetworkRequestItem['type']) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'xhr': return 'bg-amber-100 text-amber-800';
      case 'image': return 'bg-purple-100 text-purple-800';
      case 'media': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Simulated Network Waterfall & DevTools Inspector
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Step-by-step reproduction of the actual browser network requests fired when loading a movie on AutoEmbed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startSimulation}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                isRunning 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              {isRunning ? 'Tracing Requests...' : 'Replay Network Flow'}
            </button>

            <button
              onClick={() => {
                setActiveStep(SIMULATED_REQUESTS.length);
                setSelectedReq(SIMULATED_REQUESTS[0]);
              }}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Network Table & Request Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Network Trace ({visibleRequests.length} / {SIMULATED_REQUESTS.length} Requests)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Filtered: All requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-500 border-b border-slate-200 font-semibold font-mono">
                  <th className="p-2.5">Name / URL</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {visibleRequests.map((req) => {
                  const isSelected = selectedReq.id === req.id;
                  const filename = req.url.split('/').pop()?.split('?')[0] || req.url;
                  return (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedReq(req)}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-50 text-blue-900 font-medium' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <td className="p-2.5 truncate max-w-xs" title={req.url}>
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="text-slate-400 font-normal">[{req.method}]</span>
                          <span className="truncate">{filename}</span>
                        </div>
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="text-emerald-600 font-semibold">200 OK</span>
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getTypeBadge(req.type)}`}>
                          {req.type}
                        </span>
                      </td>
                      <td className="p-2.5 whitespace-nowrap text-slate-500">{req.size}</td>
                      <td className="p-2.5 whitespace-nowrap text-slate-500">{req.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Request Details */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getTypeBadge(selectedReq.type)}`}>
                {selectedReq.type.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-slate-400">{selectedReq.time}</span>
            </div>
            <h4 className="text-xs font-mono font-bold text-slate-900 break-all">
              {selectedReq.url}
            </h4>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Role in Streaming Pipeline
            </h5>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {selectedReq.roleDescription}
            </p>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Initiator
            </h5>
            <p className="text-xs font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
              {selectedReq.initiator}
            </p>
          </div>

          {selectedReq.headers && (
            <div>
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Key Response Headers
              </h5>
              <div className="bg-slate-900 text-slate-300 p-3 rounded-lg text-[11px] font-mono space-y-1 overflow-x-auto border border-slate-800">
                {Object.entries(selectedReq.headers).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-indigo-400">{k}:</span>
                    <span className="text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReq.responsePreview && (
            <div>
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Payload / Response Sample
              </h5>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-[11px] font-mono overflow-x-auto border border-slate-800 leading-relaxed max-h-36">
                {selectedReq.responsePreview}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
