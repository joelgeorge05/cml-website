import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function InstallPwaButton({ className = '' }: { className?: string }) {
  const { isInstallable, isIOS, isStandalone, handleInstallClick } = usePWAInstall();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  // If already installed, don't show the install button
  if (isStandalone) return null;
  // If not installable and not iOS (where we show the tutorial), don't show the button
  if (!isInstallable && !isIOS) return null;

  return (
    <>
      <button
        onClick={() => {
          if (isInstallable) {
            handleInstallClick();
          } else if (isIOS) {
            setShowIOSPrompt(true);
          }
        }}
        className={`flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all ${className}`}
      >
        <Download className="w-4 h-4" />
        Install App
      </button>

      {showIOSPrompt && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4 bg-slate-950/80">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl w-full max-w-sm relative text-center shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <button 
              onClick={() => setShowIOSPrompt(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Install on iOS</h3>
            <p className="text-slate-300 text-sm mb-5 leading-relaxed">
              Install this app on your iPhone or iPad for the best experience.
            </p>
            <ol className="text-left text-slate-300 text-sm space-y-4 mb-6 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <li className="flex gap-3">
                <span className="font-black text-amber-500 mt-0.5">1.</span>
                <span>Tap the <strong>Share</strong> button at the bottom of your Safari browser.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-amber-500 mt-0.5">2.</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              </li>
            </ol>
            <div className="animate-bounce text-amber-500/50 mt-2 flex justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
