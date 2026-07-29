import React, { useState, useEffect } from 'react';
import { Player, Challenge } from '../types/league';
import { validateNewChallenge } from '../utils/leagueRules';
import { sendWhatsappNotification } from '../utils/notifications';
import { Swords, X, AlertTriangle, CheckCircle2, Calendar, Clock, FileText, Zap, MessageSquare } from 'lucide-react';

interface NewChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  challenges: Challenge[];
  currentWeek: number;
  currentUser?: Player | null;
  preselectedChallenger?: Player | null;
  preselectedChallenged?: Player | null;
  onSaveChallenge: (newChallenge: Challenge) => void;
}

// Helper para formatar data local no formato YYYY-MM-DDTHH:mm
function toLocalISOString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Helper para formatar texto amigável em Português (ex: Quinta-feira, 30/07/2026 às 19:30)
function formatDateTimePtBR(dateTimeStr: string): string {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return dateTimeStr;

  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dayMonthYear = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hoursMinutes = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalizedWeekday}, ${dayMonthYear} às ${hoursMinutes}`;
}

export const NewChallengeModal: React.FC<NewChallengeModalProps> = ({
  isOpen,
  onClose,
  players,
  challenges,
  currentWeek,
  currentUser,
  preselectedChallenger,
  preselectedChallenged,
  onSaveChallenge,
}) => {
  const [challengerId, setChallengerId] = useState<string>('');
  const [challengedId, setChallengedId] = useState<string>('');
  const [sendNotification, setSendNotification] = useState<boolean>(true); // Checado por padrão por solicitação do usuário

  // Data e horário padrão: hoje às 19:00
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setHours(19, 0, 0, 0);
    return toLocalISOString(d);
  };

  const [scheduledDateTime, setScheduledDateTime] = useState<string>(getDefaultDateTime());
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const activeChallenger = preselectedChallenger || currentUser;
      if (activeChallenger) {
        setChallengerId(activeChallenger.id);
      } else if (players.length > 0 && !challengerId) {
        setChallengerId(players[0].id);
      }

      if (preselectedChallenged) {
        setChallengedId(preselectedChallenged.id);
      } else if (players.length > 1) {
        const defaultChallengerId = activeChallenger?.id || players[0].id;
        const other = players.find(p => p.id !== defaultChallengerId);
        if (other && !challengedId) {
          setChallengedId(other.id);
        }
      }
    }
  }, [isOpen, preselectedChallenger, preselectedChallenged, currentUser]);

  if (!isOpen) return null;

  const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);
  const selectedChallenger = players.find(p => p.id === challengerId);
  const selectedChallenged = players.find(p => p.id === challengedId);

  // Atalhos de Seleção Rápida de Data e Horário
  const setPresetDateTime = (type: 'today' | 'tomorrow' | 'thursday' | 'saturday') => {
    const d = new Date();
    if (type === 'today') {
      d.setHours(19, 0, 0, 0);
    } else if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
      d.setHours(20, 0, 0, 0);
    } else if (type === 'thursday') {
      const dayOfWeek = d.getDay();
      const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;
      d.setDate(d.getDate() + daysUntilThursday);
      d.setHours(19, 30, 0, 0);
    } else if (type === 'saturday') {
      const dayOfWeek = d.getDay();
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
      d.setDate(d.getDate() + daysUntilSaturday);
      d.setHours(16, 0, 0, 0);
    }
    setScheduledDateTime(toLocalISOString(d));
  };

  // Executa validação dinâmica ao alterar os selects
  const handleValidate = () => {
    if (!selectedChallenger || !selectedChallenged) {
      setValidationError('Selecione o desafiante e o desafiado.');
      return false;
    }

    const validation = validateNewChallenge(
      selectedChallenger,
      selectedChallenged,
      currentWeek,
      challenges
    );

    if (!validation.valid) {
      setValidationError(validation.reason || 'Desafio inválido pelas regras do regulamento.');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidate() || !selectedChallenger || !selectedChallenged) return;

    const formattedDateOnly = scheduledDateTime.split('T')[0];
    const formattedTimeStr = formatDateTimePtBR(scheduledDateTime);

    const newChallenge: Challenge = {
      id: `c-${Date.now()}`,
      challengerId: selectedChallenger.id,
      challengedId: selectedChallenged.id,
      challengerName: selectedChallenger.name,
      challengedName: selectedChallenged.name,
      challengerRank: selectedChallenger.rank,
      challengedRank: selectedChallenged.rank,
      challengerLevel: selectedChallenger.level,
      challengedLevel: selectedChallenged.level,
      status: 'pending',
      scheduledDate: formattedDateOnly,
      weekNumber: currentWeek,
      notes: notes ? `${notes} • ${formattedTimeStr}` : `Agendado para ${formattedTimeStr}`
    };

    onSaveChallenge(newChallenge);

    // Disparar notificação no WhatsApp do desafiado se a caixa de seleção estiver checada
    if (sendNotification) {
      sendWhatsappNotification(
        selectedChallenger,
        selectedChallenged,
        currentWeek,
        formattedTimeStr
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-2xl border border-slate-700 bg-slate-900/90 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/30 text-orange-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Novo Desafio Semanal</h3>
              <p className="text-xs text-slate-400">Semana {currentWeek} • Regulamento Oficial</p>
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
          {/* Alerta de erro de validação */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Restrição de Regulamento:</span>
                {validationError}
              </div>
            </div>
          )}

          {/* Seleção do Desafiante */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Desafiante (Quem está desafiando)
            </label>
            <select
              value={challengerId}
              onChange={(e) => {
                setChallengerId(e.target.value);
                setValidationError(null);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="">Selecione um atleta...</option>
              {sortedPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.rank} (Nível {p.level}) - {p.name} {p.status === 'cooldown' ? '⛔ [Suspenso]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Seleção do Desafiado */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Desafiado (Adversário a ser desafiado)
            </label>
            <select
              value={challengedId}
              onChange={(e) => {
                setChallengedId(e.target.value);
                setValidationError(null);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="">Selecione o adversário...</option>
              {sortedPlayers
                .filter((p) => p.id !== challengerId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.rank} (Nível {p.level}) - {p.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Widget de Seleção da Data e Horário */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                Data e Horário do Jogo
              </span>
              <span className="text-[11px] text-orange-400 font-normal">
                Seletor Integrado
              </span>
            </label>

            {/* Input DateTime-Local Stylizado */}
            <div className="relative">
              <input
                type="datetime-local"
                required
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            {/* Preview Formatado */}
            {scheduledDateTime && (
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                <span>{formatDateTimePtBR(scheduledDateTime)}</span>
              </div>
            )}

            {/* Atalhos Rápidos de Horário */}
            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Atalhos Rápidos de Horário:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPresetDateTime('today')}
                  className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-orange-500/50 text-slate-300 hover:text-orange-400 transition-colors text-center font-medium"
                >
                  Hoje 19:00
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDateTime('tomorrow')}
                  className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-orange-500/50 text-slate-300 hover:text-orange-400 transition-colors text-center font-medium"
                >
                  Amanhã 20:00
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDateTime('thursday')}
                  className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-orange-500/50 text-slate-300 hover:text-orange-400 transition-colors text-center font-medium"
                >
                  Quinta 19:30
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDateTime('saturday')}
                  className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-orange-500/50 text-slate-300 hover:text-orange-400 transition-colors text-center font-medium"
                >
                  Sábado 16:00
                </button>
              </div>
            </div>
          </div>

          {/* Observações / Quadra */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-orange-400" />
              Observações (Quadra / Detalhes)
            </label>
            <input
              type="text"
              placeholder="Ex: Quadra 1 - Iluminação Ok"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Caixa de Seleção: Notificação no WhatsApp (Checada por Padrão) */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-emerald-300 select-none">
              <input
                type="checkbox"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                Notificar atleta desafiado no WhatsApp
              </span>
            </label>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
              Padrão
            </span>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
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
              Confirmar Desafio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
