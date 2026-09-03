import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Hide button if already installed in standalone mode
  if (isInstalled) {
    return null;
  }

  // Handle Chrome / Android / Desktop Install Prompt
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className="bg-luxury-black text-white px-4 py-2.5 border-b border-luxury-gold/30 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-luxury-gold" />
            <span className="font-serif italic text-luxury-cream">Enhance your luxury experience with the MyFitStore App</span>
          </div>
          <button
            onClick={install}
            className="px-3 py-1 bg-luxury-gold text-luxury-black font-bold uppercase tracking-widest text-[10px] rounded-xs hover:bg-white transition-colors flex items-center gap-1.5"
          >
            <Download size={12} /> Install App
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className="px-3 py-1.5 border border-luxury-gold/60 text-luxury-gold hover:bg-luxury-gold hover:text-black transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 rounded-xs"
        title="Install MyFitStore Web App"
      >
        <Download size={13} />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // Handle iOS Safari Install Instructions
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-3 py-1.5 border border-luxury-gold/60 text-luxury-gold hover:bg-luxury-gold hover:text-black transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 rounded-xs"
          title="Install on iOS"
        >
          <Smartphone size={13} />
          <span className="hidden sm:inline">Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-luxury-black text-white max-w-sm w-full p-6 rounded-sm border border-luxury-gold/40 shadow-2xl relative space-y-4">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 text-luxury-gold">
                <Sparkles size={18} />
                <h3 className="text-sm font-serif italic text-white">Install MyFitStore on iOS</h3>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Access your luxury wardrobe offline and launch directly from your iPhone home screen:
              </p>

              <div className="space-y-2 bg-white/5 p-3 rounded-sm border border-white/10 text-xs">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-luxury-gold text-black font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> icon in the Safari toolbar at the bottom.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-luxury-gold text-black font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                  <span>Scroll down and select <strong>"Add to Home Screen"</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-luxury-gold text-black font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                  <span>Tap <strong>Add</strong> to complete installation.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 bg-luxury-gold text-black font-bold uppercase tracking-wider text-xs rounded-xs hover:bg-white transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export default PWAInstallButton;
