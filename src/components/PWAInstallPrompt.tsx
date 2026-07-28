import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Detectar evento de instalação no Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Detectar se já está instalado ou rodando em modo standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || isDismissed || !deferredPrompt) return null;

  return (
    <div className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-2.5 shadow-lg flex items-center justify-between gap-3 animate-fadeIn border-b border-orange-500/40 z-50">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-black/20 rounded-lg shrink-0">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div className="text-xs">
          <span className="font-bold block">Instalar o App da Liga de Badminton</span>
          <span className="text-[11px] text-orange-100 opacity-90">
            Acesse direto da sua tela inicial como um aplicativo nativo!
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3.5 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5 border border-white/20"
        >
          <Download className="w-3.5 h-3.5" />
          Instalar App
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 rounded-lg hover:bg-black/20 text-orange-200 transition-colors"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
