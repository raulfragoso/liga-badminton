import React, { useState, useEffect } from 'react';
import { Player, UserRole } from '../types/league';
import { generateRandomPassword, formatPhoneMask, formatPhoneDisplay, sanitizePhone } from '../utils/auth';
import { UserCheck, X, Phone, User, CheckCircle2, Trash2, ShieldAlert, Trophy, Lock, Key, ShieldCheck } from 'lucide-react';

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  currentUser?: Player | null;
  onSavePlayer: (updatedPlayer: Player) => void;
  onDeletePlayer?: (playerId: string) => void;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({
  isOpen,
  onClose,
  player,
  currentUser,
  onSavePlayer,
  onDeletePlayer,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('athlete');
  const [level, setLevel] = useState(1);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [status, setStatus] = useState<'active' | 'cooldown' | 'injured'>('active');
  const [cooldownUntil, setCooldownUntil] = useState('');
  const [cooldownReason, setCooldownReason] = useState('');

  useEffect(() => {
    if (player) {
      setName(player.name || '');
      setPhone(formatPhoneDisplay(player.phone || ''));
      setPassword(player.password || '123456');
      setRole(player.role || 'athlete');
      setLevel(player.level || 1);
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

  const handleGeneratePassword = () => {
    const newPass = generateRandomPassword();
    setPassword(newPass);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanPhoneDigits = sanitizePhone(phone);

    const updatedPlayer: Player = {
      ...player,
      name: name.trim(),
      phone: cleanPhoneDigits || undefined,
      password: password.trim() || '123456',
      role,
      level: Number(level) || 1,
      wins: Number(wins),
      losses: Number(losses),
      status,
      cooldownUntil: status === 'cooldown' && cooldownUntil ? new Date(cooldownUntil).toISOString() : undefined,
      cooldownReason: status === 'cooldown' ? cooldownReason : undefined
    };

    onSavePlayer(updatedPlayer);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja remover o atleta ${player.name} da liga?`)) {
      if (onDeletePlayer) {
        onDeletePlayer(player.id);
        onClose();
      }
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
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-400" />
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Telefone e Tipo de Perfil */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                Telefone (Login)
              </label>
              <input
                type="text"
                maxLength={15}
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                Tipo de Usuário
              </label>
              <select
                disabled={!isAdmin}
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500 ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <option value="athlete">Atleta Participante</option>
                <option value="admin">👑 Administrador</option>
              </select>
            </div>
          </div>

          {/* Nível na Pirâmide */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-orange-400" />
              Nível na Pirâmide {!isAdmin && <span className="text-[10px] text-slate-500 font-normal">(Somente Admin)</span>}
            </label>
            <input
              type="number"
              min="1"
              max="20"
              disabled={!isAdmin}
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500 font-bold ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Senha de Acesso */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-400" />
                Senha de Acesso
              </span>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-normal underline"
              >
                <Key className="w-3 h-3" /> Gerar Nova Senha
              </button>
            </label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Vitórias e Derrotas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-orange-400" />
                Vitórias {!isAdmin && <span className="text-[10px] text-slate-500 font-normal">(Automático)</span>}
              </label>
              <input
                type="number"
                min="0"
                disabled={!isAdmin}
                value={wins}
                onChange={(e) => setWins(Number(e.target.value))}
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500 font-bold ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <X className="w-3.5 h-3.5 text-rose-400" />
                Derrotas {!isAdmin && <span className="text-[10px] text-slate-500 font-normal">(Automático)</span>}
              </label>
              <input
                type="number"
                min="0"
                disabled={!isAdmin}
                value={losses}
                onChange={(e) => setLosses(Number(e.target.value))}
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500 font-bold ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
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
            {isAdmin && onDeletePlayer ? (
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
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
