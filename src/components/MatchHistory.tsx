import React, { useState } from 'react';
import { Challenge, Player } from '../types/league';
import { sendWhatsappNotification } from '../utils/notifications';
import { Swords, Calendar, CheckCircle2, Clock, ShieldAlert, Search, Pencil, MessageSquare } from 'lucide-react';

interface MatchHistoryProps {
  challenges: Challenge[];
  players?: Player[];
  onSelectChallengeToResolve: (challenge: Challenge) => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  challenges,
  players = [],
  onSelectChallengeToResolve,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredChallenges = challenges.filter(c => {
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'pending' && c.status === 'pending') ||
      (filterStatus === 'completed' && c.status === 'completed') ||
      (filterStatus === 'wo' && (c.status.includes('wo') || c.status.includes('refused')));

    const matchesQuery = 
      c.challengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.challengedName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesQuery;
  });

  const getStatusBadge = (status: Challenge['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Concluído
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Pendente
          </span>
        );
      case 'wo_challenged':
      case 'refused_wo':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            WO Desafiado
          </span>
        );
      case 'wo_challenger':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            WO Desafiante (Suspensão)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Swords className="w-5 h-5 text-orange-400" />
            Histórico de Confrontos e Desafios
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe o status dos jogos agendados e os efeitos nas posições da pirâmide.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Busca por Nome */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar atleta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Filtro de Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
          >
            <option value="all">Todos os Jogos</option>
            <option value="pending">Pendentes</option>
            <option value="completed">Concluídos</option>
            <option value="wo">Casos de W.O. / Recusas</option>
          </select>
        </div>
      </div>

      {/* Lista de Desafios */}
      <div className="space-y-3">
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            Nenhum desafio encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="glass-card rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-700"
            >
              {/* Informações Principais */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-950 border border-slate-800 text-center min-w-[70px]">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Semana</span>
                  <span className="text-base font-extrabold text-orange-400">#{challenge.weekNumber}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-100 flex-wrap">
                    <span className={challenge.winnerId === challenge.challengerId ? 'text-orange-400 font-extrabold' : ''}>
                      {challenge.challengerName}
                      <span className="text-xs text-slate-400 font-normal ml-1">(Nível {challenge.challengerLevel})</span>
                    </span>
                    <span className="text-slate-500 font-normal">vs</span>
                    <span className={challenge.winnerId === challenge.challengedId ? 'text-orange-400 font-extrabold' : ''}>
                      {challenge.challengedName}
                      <span className="text-xs text-slate-400 font-normal ml-1">(Nível {challenge.challengedLevel})</span>
                    </span>
                  </div>

                  {/* Resumo do resultado ou data */}
                  {challenge.resultSummary ? (
                    <p className="text-xs text-slate-300 font-medium bg-slate-950/40 px-2 py-1 rounded border border-slate-800/60">
                      {challenge.resultSummary}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Data Agendada: {challenge.scheduledDate} {challenge.notes && `• ${challenge.notes}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Placar / Status e Ação */}
              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800/80">
                {/* Exibição dos Games se concluído */}
                {challenge.games && challenge.games.length > 0 && (
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-xs font-bold text-slate-200 whitespace-nowrap shrink-0">
                    {challenge.games.map((g, idx) => (
                      <React.Fragment key={idx}>
                        <span>{g.challengerScore}–{g.challengedScore}</span>
                        {idx < challenge.games!.length - 1 && (
                          <span className="text-slate-600 font-normal">|</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {getStatusBadge(challenge.status)}

                {challenge.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const challengedPlayer = players.find(p => p.id === challenge.challengedId);
                        const challengerPlayer = players.find(p => p.id === challenge.challengerId);
                        sendWhatsappNotification(
                          challengerPlayer || ({ name: challenge.challengerName, level: challenge.challengerLevel } as any),
                          challengedPlayer || ({ name: challenge.challengedName, level: challenge.challengedLevel, phone: '' } as any),
                          challenge.weekNumber,
                          challenge.notes
                        );
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                      title="Reenviar Notificação no WhatsApp do Desafiado"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => onSelectChallengeToResolve(challenge)}
                      className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow transition-all whitespace-nowrap"
                    >
                      Registrar Resultado
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectChallengeToResolve(challenge)}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-orange-400 border border-slate-800 text-xs font-semibold transition-colors flex items-center gap-1"
                    title="Editar Resultado do Jogo"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
