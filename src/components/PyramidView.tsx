import React from 'react';
import { Player } from '../types/league';
import { buildPyramidTiers } from '../utils/leagueRules';
import { Trophy, Swords, AlertCircle, ShieldAlert, Award, ChevronRight, CheckCircle2, Pencil } from 'lucide-react';
import { useLeague } from '../contexts/LeagueContext';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';

export const PyramidView: React.FC = () => {
  const { players, challenges, settings } = useLeague();
  const { 
    setPreselectedChallenged, 
    setIsNewChallengeModalOpen, 
    setSelectedChallengeToResolve, 
    setIsMatchResultModalOpen, 
    setSelectedPlayerToEdit, 
    setIsEditPlayerModalOpen 
  } = useUI();
  const { currentUser } = useAuth();

  const currentWeek = settings.currentWeek;
  const tiers = buildPyramidTiers(players);

  // Função auxiliar para verificar status do jogador na semana
  const getPlayerStatusInfo = (player: Player) => {
    // Cooldown/Punição
    if (player.status === 'cooldown' && player.cooldownUntil) {
      const until = new Date(player.cooldownUntil);
      if (until > new Date()) {
        return {
          label: 'Suspenso (2 sem)',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
          canChallenge: false,
          tooltip: player.cooldownReason || 'Em punição de 2 semanas'
        };
      }
    }

    // Já desafiou nesta semana (dinâmico via lista de desafios da semana)
    const hasChallengeThisWeek = challenges.some(
      c => c.weekNumber === currentWeek && c.challengerId === player.id
    );

    if (hasChallengeThisWeek) {
      return {
        label: 'Já desafiou nesta sem.',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        canChallenge: false,
        tooltip: 'Já realizou o desafio semanal'
      };
    }

    return {
      label: 'Disponível',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      canChallenge: true,
      tooltip: 'Pronto para novos desafios'
    };
  };

  // Verifica se há desafio pendente envolvendo o jogador
  const getPendingChallengeForPlayer = (playerId: string) => {
    return challenges.find(
      c => c.status === 'pending' && (c.challengerId === playerId || c.challengedId === playerId)
    );
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 py-4">
      {/* Banner Informativo do Regulamento da Pirâmide */}
      <div className="w-full max-w-5xl glass-panel rounded-2xl p-4 md:p-6 border border-orange-500/30 bg-slate-900/60 hidden md:flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/30 text-orange-400">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Pirâmide Geral da Liga de Badminton
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                Semana {currentWeek}
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Vença atletas de níveis superiores para assumir a posição deles na pirâmide. O topo (Nível 1) é o campeão da temporada.
            </p>
          </div>
        </div>

        {/* Legenda de Premiação */}
        <div className="flex items-center gap-2 bg-slate-950/70 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
          <Award className="w-4 h-4 text-orange-400" />
          <span className="text-slate-300">Premiação (a cada 3 meses):</span>
          <span className="font-semibold text-orange-400">3 Primeiros Níveis</span>
        </div>
      </div>

      {/* Renderização em Pirâmide */}
      <div className="w-full max-w-6xl flex flex-col items-center gap-6 px-2">
        {tiers.map((tier) => {
          const maxLevelInTiers = Math.max(...tiers.map(t => t.level));
          const isTopTier = tier.level === maxLevelInTiers && maxLevelInTiers > 1;
          const isLevel1 = tier.level === 1;

          return (
            <div key={tier.level} className="w-full flex flex-col items-center gap-2">
              {/* Rótulo do Nível da Pirâmide */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {isLevel1 ? (
                  <span className="text-orange-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5"/> NÍVEL 1 (NÍVEL INICIAL DE ENTRADA)
                  </span>
                ) : isTopTier ? (
                  <span className="text-amber-400 flex items-center gap-1 font-bold">
                    <Trophy className="w-3.5 h-3.5"/> NÍVEL {tier.level} (TOPO DA PIRÂMIDE)
                  </span>
                ) : (
                  <span>NÍVEL {tier.level}</span>
                )}
                <span className="text-slate-600">({tier.players.length}/{tier.capacity} vagas)</span>
              </div>

              {/* Grid de Atletas do Nível */}
              <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 max-w-full">
                {tier.players.map((player) => {
                  const status = getPlayerStatusInfo(player);
                  const pendingMatch = getPendingChallengeForPlayer(player.id);

                  // Estilo da borda com base na posição
                  let borderStyle = "border-slate-800 hover:border-slate-600";
                  let bgStyle = "bg-slate-900/80";
                  let badgeStyle = "bg-slate-800 text-slate-300";

                  if (player.rank === 1) {
                    borderStyle = "border-orange-500/80 animate-glow shadow-lg shadow-orange-500/20";
                    bgStyle = "bg-gradient-to-b from-orange-950/40 to-slate-900/90";
                    badgeStyle = "bg-orange-500 text-slate-950 font-black";
                  } else if (player.rank === 2 || player.rank === 3) {
                    borderStyle = "border-slate-400/50";
                    bgStyle = "bg-gradient-to-b from-slate-800/60 to-slate-900/90";
                    badgeStyle = "bg-slate-300 text-slate-950 font-bold";
                  } else if (player.rank >= 4 && player.rank <= 6) {
                    borderStyle = "border-amber-700/50";
                    bgStyle = "bg-gradient-to-b from-amber-950/20 to-slate-900/90";
                    badgeStyle = "bg-amber-700 text-amber-100 font-bold";
                  }

                  return (
                    <div
                      key={player.id}
                      className={`relative group glass-card rounded-2xl p-3.5 sm:p-4 transition-all duration-300 hover:-translate-y-1 w-full max-w-[280px] sm:w-64 md:w-72 border ${borderStyle} ${bgStyle} flex flex-col justify-between`}
                    >
                      {/* Topo do Card: Rank e Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-lg text-xs tracking-wide ${badgeStyle}`}>
                            #{player.rank}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-medium">
                            Nível {player.level}
                          </span>
                        </div>

                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${status.badgeColor}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>

                      {/* Info do Atleta */}
                      <div 
                        className="flex items-center gap-3 cursor-pointer group-hover:text-orange-400 transition-colors"
                        onClick={() => {
                          setSelectedPlayerToEdit(player);
                          setIsEditPlayerModalOpen(true);
                        }}
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-sm shadow-inner group-hover:border-orange-500/50">
                          {player.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h4 className="font-bold text-slate-100 text-sm truncate group-hover:text-orange-300">
                            {player.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="text-orange-400 font-semibold">{player.wins}V</span>
                            <span>•</span>
                            <span className="text-rose-400 font-semibold">{player.losses}D</span>
                            <span>•</span>
                            <span>{player.wins + player.losses > 0 ? `${Math.round((player.wins / (player.wins + player.losses)) * 100)}%` : '0%'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Desafio Pendente / Botões de Ação */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs">
                        {pendingMatch ? (
                          <button
                            onClick={() => {
                              setSelectedChallengeToResolve(pendingMatch);
                              setIsMatchResultModalOpen(true);
                            }}
                            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors font-medium text-left"
                          >
                            <span className="flex items-center gap-1.5">
                              <Swords className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              Jogo Pendente
                            </span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            disabled={!status.canChallenge}
                            onClick={() => {
                              setPreselectedChallenged(player);
                              setIsNewChallengeModalOpen(true);
                            }}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                              status.canChallenge
                                ? 'bg-orange-600/20 hover:bg-orange-600 text-orange-300 hover:text-white border border-orange-500/40 shadow-sm'
                                : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
                            }`}
                          >
                            <Swords className="w-3.5 h-3.5" />
                            Desafiar
                          </button>
                        )}
                        {(currentUser?.role === 'admin' || currentUser?.id === player.id) && (
                          <button
                            onClick={() => {
                              setSelectedPlayerToEdit(player);
                              setIsEditPlayerModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-orange-400 border border-slate-800 transition-colors"
                            title={currentUser?.id === player.id ? "Editar Meu Perfil" : "Editar Dados do Atleta (Admin)"}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
