import React, { useState, useEffect } from 'react';
import { UserRole } from '../types/league';
import { generateRandomPassword, formatPhoneMask, formatPhoneDisplay, sanitizePhone } from '../utils/auth';
import { UserCheck, X, Phone, User, CheckCircle2, Trash2, ShieldAlert, Trophy, Lock, Key } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useLeague } from '../contexts/LeagueContext';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';

export const EditPlayerModal: React.FC = () => {
  const { handleSavePlayer, handleDeletePlayer } = useLeague();
  const { 
    isEditPlayerModalOpen: isOpen, 
    setIsEditPlayerModalOpen, 
    selectedPlayerToEdit: player 
  } = useUI();
  const { currentUser } = useAuth();
  
  const onClose = () => setIsEditPlayerModalOpen(false);
  const isAdmin = currentUser?.role === 'admin';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('athlete');
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [status, setStatus] = useState<'active' | 'cooldown' | 'injured'>('active');
  const [cooldownUntil, setCooldownUntil] = useState('');
  const [cooldownReason, setCooldownReason] = useState('');

  useEffect(() => {
    if (player) {
      setName(player.name || '');
      setPhone(formatPhoneDisplay(player.phone || ''));
      setRole(player.role || 'athlete');
      setWins(player.wins || 0);
      setLosses(player.losses || 0);
      setStatus(player.status || 'active');
      setCooldownUntil(
        player.cooldownUntil
          ? new Date(player.cooldownUntil).toISOString().split('T')[0]
          : ''
      );
      setCooldownReason(player.cooldownReason || '');
    }
  }, [player]);

  if (!isOpen || !player) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanPhoneDigits = sanitizePhone(phone);

    const updatedPlayer = {
      ...player,
      name: name.trim(),
      phone: cleanPhoneDigits || undefined,
      role,
      level: player.level || 1,
      wins: Number(wins),
      losses: Number(losses),
      status,
      cooldownUntil: status === 'cooldown' && cooldownUntil ? new Date(cooldownUntil).toISOString() : undefined,
      cooldownReason: status === 'cooldown' ? cooldownReason : undefined
    };

    handleSavePlayer(updatedPlayer);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir o atleta ${player.name}?`)) {
      handleDeletePlayer(player.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/30 text-orange-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Editar Dados do Atleta</h3>
              <p className="text-xs text-slate-400">
                Rank #{player.rank} • Nível {player.level} na Pirâmide
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {!isAdmin && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Você está editando o seu próprio perfil. Alterações em Nível, Rank e Status só podem ser realizadas por um Administrador da Liga.</span>
            </div>
          )}

          {/* Nome Completo */}
          <Input
            label="Nome Completo"
            leftIcon={<User className="w-4 h-4" />}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Telefone e Tipo de Perfil */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Telefone (Login)"
              leftIcon={<Phone className="w-4 h-4" />}
              type="text"
              maxLength={15}
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
            />

            <Select
              label="Tipo de Usuário"
              disabled={!isAdmin}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={[
                { value: 'athlete', label: 'Atleta Participante' },
                { value: 'admin', label: '👑 Administrador' }
              ]}
              className={!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}
            />
          </div>

          {/* Nível na Pirâmide */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-orange-400" />
                Nível na Pirâmide
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Calculado pelo histórico de partidas</span>
            </label>
            <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 font-bold flex items-center justify-between">
              <span>Nível {player.level || 1}</span>
              <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                Automático
              </span>
            </div>
          </div>

          {/* Acesso (Supabase Auth) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <Lock className="w-4 h-4 text-slate-400" />
              Segurança de Acesso
            </div>
            
            {isAdmin ? (
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-400">
                  As senhas são protegidas por criptografia do Supabase. Como admin, você pode gerar uma nova senha temporária para este atleta.
                </p>
                <Button
                  type="button"
                  onClick={async () => {
                    const newPass = generateRandomPassword();
                    try {
                      const { supabase } = await import('../utils/supabaseClient');
                      if (supabase) {
                        const { error } = await supabase.rpc('admin_reset_player_password', { target_id: player.id, new_password: newPass });
                        if (error) throw error;
                        alert(`Senha redefinida com sucesso!\n\nEnvie a seguinte senha para o atleta via WhatsApp:\n\n${newPass}\n\n(Anote-a, esta mensagem não será exibida novamente)`);
                      }
                    } catch (err) {
                      alert('Erro ao redefinir a senha no cofre do Supabase. Verifique as permissões.');
                    }
                  }}
                  className="bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/30 px-3 py-1.5 h-auto text-[11px] whitespace-nowrap"
                >
                  <Key className="w-3.5 h-3.5 mr-1" /> Gerar Nova Senha
                </Button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Sua senha é protegida por criptografia de ponta a ponta. Se você esquecê-la ou precisar alterá-la, contate o administrador no WhatsApp.
              </p>
            )}
          </div>

          {/* Vitórias e Derrotas */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Vitórias"
              leftIcon={<Trophy className="w-4 h-4" />}
              type="number"
              min="0"
              disabled={!isAdmin}
              value={wins}
              onChange={(e) => setWins(Number(e.target.value))}
              className={`font-bold ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
            />

            <Input
              label="Derrotas"
              leftIcon={<X className="w-4 h-4" />}
              type="number"
              min="0"
              disabled={!isAdmin}
              value={losses}
              onChange={(e) => setLosses(Number(e.target.value))}
              className={`font-bold ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Status do Atleta */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Status Atual na Liga {!isAdmin && <span className="text-[10px] text-slate-500 font-normal">(Somente Admin)</span>}
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                disabled={!isAdmin}
                onClick={() => setStatus('active')}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                  status === 'active'
                    ? 'bg-orange-600/20 border-orange-500 text-orange-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                } ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                ✅ Ativo
              </button>
              <button
                type="button"
                disabled={!isAdmin}
                onClick={() => setStatus('cooldown')}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                  status === 'cooldown'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                } ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                ⛔ Suspenso
              </button>
              <button
                type="button"
                disabled={!isAdmin}
                onClick={() => setStatus('injured')}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                  status === 'injured'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                } ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                🩹 Lesionado
              </button>
            </div>
          </div>

          {/* Detalhes de Cooldown (se Suspenso) */}
          {status === 'cooldown' && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Configurar Suspensão / Cooldown
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Suspenso até a data:
                </label>
                <input
                  type="date"
                  disabled={!isAdmin}
                  value={cooldownUntil}
                  onChange={(e) => setCooldownUntil(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Motivo da Suspensão:
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  placeholder="Ex: Derrota para desafiado de nível superior"
                  value={cooldownReason}
                  onChange={(e) => setCooldownReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
            {isAdmin ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Atleta
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button type="submit">
                <CheckCircle2 className="w-4 h-4" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
