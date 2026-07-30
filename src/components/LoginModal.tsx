import React, { useState } from 'react';
import { Player } from '../types/league';
import { validateAndAuthenticateUser, formatPhoneMask } from '../utils/auth';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { isSupabaseConfigured } from '../utils/supabaseClient';
import { LogIn, X, Lock, ShieldCheck, User, Sparkles, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useLeague } from '../contexts/LeagueContext';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';

export const LoginModal: React.FC = () => {
  const { players } = useLeague();
  const { isLoginModalOpen: isOpen, setIsLoginModalOpen } = useUI();
  const { handleLoginSuccess } = useAuth();

  const onClose = () => setIsLoginModalOpen(false);
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

    if (isSupabaseConfigured) {
      try {
        const { supabase, formatPhoneToEmail } = await import('../utils/supabaseClient');
        if (!supabase) throw new Error('Supabase indisponível');

        // Tratamento especial para o "admin" raiz, se houver
        const cleanPhone = phone.trim().toLowerCase();
        const email = cleanPhone === 'admin' ? 'admin@ligabadminton.com' : formatPhoneToEmail(phone);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setErrorMessage('Telefone ou senha incorretos.');
        } else if (data.session?.user) {
          // Busca o perfil público para injetar no Contexto
          const { data: profile } = await supabase.from('players').select('*').eq('id', data.session.user.id).single();
          
          if (profile) {
            handleLoginSuccess({
              id: profile.id,
              name: profile.name,
              rank: profile.rank,
              level: profile.level,
              phone: profile.phone || undefined,
              role: profile.role,
              wins: profile.wins,
              losses: profile.losses,
              status: profile.status,
              createdAt: profile.created_at || new Date().toISOString().split('T')[0]
            });
            onClose();
          } else {
            setErrorMessage('Perfil do atleta não encontrado.');
          }
        }
      } catch (err) {
        setErrorMessage('Erro de conexão com o servidor.');
      }
    } else {
      // Fallback local se não tiver nuvem
      let authResult = validateAndAuthenticateUser(players, phone, password);
      if (authResult.success && authResult.user) {
        handleLoginSuccess(authResult.user);
        onClose();
      } else {
        setErrorMessage(authResult.errorMessage || 'Falha na autenticação local.');
      }
    }

    setIsSubmitting(false);
  };

  const handleQuickLogin = async (player: Player) => {
    // Para simplificar a transição, preenche os campos para o usuário digitar a senha
    setPhone(player.phone || (player.role === 'admin' ? 'admin' : ''));
    setPassword('');
    setErrorMessage('Por favor, digite sua senha de acesso.');
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Telefone ou Login */}
          <Input
            label="Telefone ou Login ('admin')"
            leftIcon={<User className="w-4 h-4" />}
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
          />

          {/* Senha com alternador de visibilidade */}
          <Input
            label="Senha de Acesso"
            leftIcon={<Lock className="w-4 h-4" />}
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
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          
          <div className="flex justify-end pt-1">
            <button 
              type="button" 
              onClick={() => alert("Como não utilizamos e-mail na Liga, por favor, envie uma mensagem no WhatsApp para o Administrador solicitando uma nova senha.")}
              className="text-xs text-orange-400/80 hover:text-orange-400 transition-colors font-medium"
            >
              Esqueci minha senha
            </button>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            fullWidth
            size="lg"
            className="mt-2 text-sm"
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
          </Button>

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
