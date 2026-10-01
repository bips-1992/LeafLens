import React from 'react';
import { WifiOff, BookOpen } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC<{ onOpenFieldGuide?: () => void }> = ({ onOpenFieldGuide }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto z-50 flex items-center justify-between gap-3 rounded-xl bg-amber-500/95 backdrop-blur px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-xl border border-amber-300/40">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-slate-950" />
        <span>Offline Mode — AI scan requires network; offline field guide available!</span>
      </div>
      {onOpenFieldGuide && (
        <button
          onClick={onOpenFieldGuide}
          className="flex items-center gap-1 underline font-bold hover:text-white transition cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Open Guide</span>
        </button>
      )}
    </div>
  );
};
