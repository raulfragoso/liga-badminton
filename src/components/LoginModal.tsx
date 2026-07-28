import React, { useState } from 'react';
import { Player } from '../types/league';
import { validateAndAuthenticateUser, formatPhoneMask } from '../utils/auth';
import { fetchPlayersFromSupabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { LogIn, X, Lock, ShieldCheck, User, Sparkles, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onLoginSuccess: (user: Player) => void;
  onUpdatePlayers?: (players: Player[]) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  players,
  onLoginSuccess,
  onUpdatePlayers,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    let currentPlayers = players;
    let authResult = validateAndAuthenticateUser(currentPlayers, phone, password);

    // Se falhar a autenticação local, busca atletas em tempo real direto no Supabase
    if (!authResult.success && isSupabaseConfigured) {
      try {
        const cloudPlayers = await fetchPlayersFromSupabase();
        if (cloudPlayers && cloudPlayers.length > 0) {
          currentPlayers = cloudPlayers;
          if (onUpdatePlayers) {
            onUpdatePlayers(cloudPlayers);
          }
          authResult = validateAndAuthenticateUser(currentPlayers, phone, password);
        }
      } catch (err) {
        console.error('Erro ao consultar Supabase durante o login:', err);
      }
    }

    setIsSubmitting(false);

    if (authResult.success && authResult.user) {
      onLoginSuccess(authResult.user);
      onClose();
    } else {
      setErrorMessage(authResult.errorMessage || 'Falha na autenticação. Verifique os dados informados.');
    }
  };

  const handleQuickLogin = (player: Player) => {
    const adminEnvPass = import.meta.env.VITE_ADMIN_PASSWORD || 'm3t4bad';
    const adminEnvPhone = import.meta.env.VITE_ADMIN_PHONE || 'admin';
    const userPass = player.role === 'admin' ? adminEnvPass : (player.password || '1234');
    setPhone(player.phone || (player.role === 'admin' ? adminEnvPhone : ''));
    setPassword(userPass);
    setErrorMessage('');

    const authResult = validateAndAuthenticateUser(players, player.phone || '', userPass);
    if (authResult.success && authResult.user) {
      onLoginSuccess(authResult.user);
      onClose();
    }
  };

  const adminPlayer = players.find(p => p.role === 'admin');
  const athletePlayer = players.find(p => p.role === 'athlete');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/30 text-orange-400">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Acessar a Liga</h3>
              <p className="text-xs text-slate-400">Autenticação com Telefone e Senha</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isSupabaseConfigured && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-amber-200 block">Modo Local (Nuvem não conectada):</span>
                <span>
                  Para que os atletas cadastrados no computador apareçam no celular, é necessário adicionar as variáveis <strong>VITE_SUPABASE_URL</strong> e <strong>VITE_SUPABASE_ANON_KEY</strong> na Vercel.
                </span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Telefone ou Login */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-400" />
              Telefone ou Login ("admin")
            </label>
            <input
              type="text"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="username"
              placeholder="Ex: (11) 98765-4321 ou admin"
              value={phone}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d/.test(val) || val.startsWith('(')) {
                  setPhone(formatPhoneMask(val));
                } else {
                  setPhone(val);
                }
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 font-medium"
            />
          </div>

          {/* Senha com alternador de visibilidade */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-orange-400" />
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-100 focus:outline-none focus:border-orange-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando no Supabase...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar e Autenticar</span>
              </>
            )}
          </button>

          {/* Atalhos para Testes / Demonstração (Somente se existirem atletas) */}
          {(adminPlayer || athletePlayer) && (
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="block text-[10px] font-semibold uppercase text-slate-400 tracking-wider text-center flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-400" />
                Atalhos de Teste com Validação Real
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {adminPlayer && (
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(adminPlayer)}
                    className="p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 font-medium transition-all text-left flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
                    <div>
                      <div className="font-bold text-[11px]">Administrador</div>
                      <div className="text-[10px] text-slate-400 truncate">{adminPlayer.name}</div>
                    </div>
                  </button>
                )}

                {athletePlayer && (
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(athletePlayer)}
                    className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium transition-all text-left flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="font-bold text-[11px]">Atleta</div>
                      <div className="text-[10px] text-slate-400 truncate">{athletePlayer.name}</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Botão de Limpeza do Cache Local do Navegador */}
          <div className="pt-3 border-t border-slate-800/60 text-center">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Deseja realmente limpar todos os dados e cache salvos neste navegador/dispositivo?')) {
                  localStorage.clear();
                  if ('caches' in window) {
                    caches.keys().then(names => {
                      names.forEach(name => caches.delete(name));
                    });
                  }
                  window.location.reload();
                }
              }}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors underline cursor-pointer"
            >
              🧹 Limpar dados e cache salvos neste dispositivo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
