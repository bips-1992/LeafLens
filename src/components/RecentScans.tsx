import React from 'react';
import { Leaf, Clock, Trash2, ChevronRight, Shield, Sparkles, Camera } from 'lucide-react';
import { ScanRecord } from '../types';

interface RecentScansProps {
  scans: ScanRecord[];
  onSelectScan: (scan: ScanRecord) => void;
  onClearScans: () => void;
  onStartCamera: () => void;
}

export const RecentScans: React.FC<RecentScansProps> = ({
  scans,
  onSelectScan,
  onClearScans,
  onStartCamera,
}) => {
  const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Recent Session Scans</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-emerald-400 font-mono">
              {scans.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Ephemeral private memory — cleared automatically when browser closes
          </p>
        </div>

        {scans.length > 0 && (
          <button
            onClick={onClearScans}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-slate-800/80 transition cursor-pointer"
            title="Wipe current session scans"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {scans.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No Scans in Current Session</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Take a live photo of any leaf to identify magnesium, potassium, nitrogen or other nutrient deficiencies.
            </p>
          </div>
          <button
            onClick={onStartCamera}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/25 inline-flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan a Plant Leaf</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {scans.map((scan) => (
            <button
              key={scan.id}
              onClick={() => onSelectScan(scan)}
              className="w-full p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-emerald-500/40 text-left transition flex items-center justify-between gap-4 cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={scan.thumbnail || scan.image}
                  alt={scan.diagnosis.plantName}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0 group-hover:scale-105 transition"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
                      {scan.diagnosis.shortSummary}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {scan.diagnosis.plantName || 'Plant Foliage'}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatTime(scan.timestamp)}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      {scan.diagnosis.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Privacy Notice Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <p>
          <strong className="text-slate-300">Privacy Guarantee:</strong> All scan data is strictly ephemeral and local to this tab. Closing your browser completely resets your history. No accounts, logins, or server tracking.
        </p>
      </div>
    </div>
  );
};
