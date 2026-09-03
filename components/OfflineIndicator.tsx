import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[200] max-w-sm bg-luxury-black/95 text-white p-4 rounded-sm shadow-2xl border border-luxury-gold/40 backdrop-blur-md animate-fade-in flex items-start gap-3">
      <div className="p-2 bg-luxury-gold/20 text-luxury-gold rounded-full shrink-0 mt-0.5">
        <WifiOff size={16} />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-luxury-gold">
          <span>Offline Mode Active</span>
          <ShieldCheck size={13} />
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
          Intermittent connectivity detected. Essential static assets and basic UI are loaded from your service worker cache.
        </p>
      </div>
    </div>
  );
};

export default OfflineIndicator;
