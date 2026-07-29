import React, { useState } from 'react';
import { Player } from '../types/league';
import { 
  Layers, 
  Search, 
  Swords,
  ShieldCheck, 
  Phone, 
  Medal, 
  SlidersHorizontal
} from 'lucide-react';
import { formatPhoneDisplay } from '../utils/auth';
import { useLeague } from '../contexts/LeagueContext';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';

export const LevelListView: React.FC = () => {
  const { players } = useLeague();
  const {
    setPreselectedChallenged,
    setIsNewChallengeModalOpen,
    setSelectedPlayerToEdit,
    setIsEditPlayerModalOpen
  } = useUI();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc: Nível mais alto primeiro (Topo -> Base)

  const isAdmin = currentUser?.role === 'admin';

  // Descobrir o maior nível cadastrado
  const maxLevel = players.length > 0 
    ? Math.max(...players.map(p => p.level || 1), 1) 
    : 1;

  // Filtrar atletas por busca de texto
  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.phone && p.phone.includes(searchTerm));
    const matchesLevel = selectedLevelFilter === 'all' || p.level === selectedLevelFilter;
    return matchesSearch && matchesLevel;
  });

  // Agrupar atletas por nível
  const levelsMap = new Map<number, Player[]>();
  filteredPlayers.forEach(p => {
    const lvl = p.level || 1;
    if (!levelsMap.has(lvl)) {
      levelsMap.set(lvl, []);
    }
    levelsMap.get(lvl)!.push(p);
  });

  // Ordenar atletas em cada nível pelo Rank
  levelsMap.forEach((pList) => {
    pList.sort((a, b) => a.rank - b.rank);
  });

  // Criar lista ordenada de níveis existentes (ou de 1 até maxLevel)
  const allLevels = Array.from({ length: maxLevel }, (_, i) => i + 1);
  const orderedLevels = sortOrder === 'desc' 
    ? [...allLevels].reverse() 
    : allLevels;

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Cabeçalho da Aba */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/30 text-orange-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Classificação por Níveis da Pirâmide</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualização em blocos organizados por nível hierárquico, ranqueamento e saldo de pontos acumulados.
          </p>
        </div>

        {/* Filtros e Busca Responsivos */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Busca por Nome */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar atleta por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filtro de Nível */}
            <select
              value={selectedLevelFilter}
              onChange={(e) => setSelectedLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="flex-1 sm:flex-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-semibold"
            >
              <option value="all">Todos os Níveis</option>
              {allLevels.map(lvl => (
                <option key={lvl} value={lvl}>Nível {lvl}</option>
              ))}
            </select>

            {/* Botão Alternar Ordem */}
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex-1 sm:flex-none justify-center px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title="Alternar ordem de exibição dos níveis"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
              {sortOrder === 'desc' ? 'Topo → Base' : 'Base → Topo'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Blocos por Nível */}
      <div className="space-y-6">
        {orderedLevels.map((levelNumber) => {
          const levelPlayers = levelsMap.get(levelNumber) || [];
          
          // Se houver busca/filtro e este nível não tiver atletas, ignorar na exibição
          if (selectedLevelFilter !== 'all' && selectedLevelFilter !== levelNumber) return null;
          if (searchTerm && levelPlayers.length === 0) return null;

          return (
            <div 
              key={levelNumber} 
              className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-lg"
            >
              {/* Cabeçalho do Bloco de Nível */}
              <div className="bg-slate-900/95 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-orange-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-orange-600/30">
                    N{levelNumber}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Nível {levelNumber}
                      {levelNumber === maxLevel && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                          👑 Topo da Pirâmide
                        </span>
                      )}
                      {levelNumber === 1 && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                          🚪 Nível de Entrada
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {levelPlayers.length} atleta{levelPlayers.length !== 1 ? 's' : ''} neste nível
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Bloco #{levelNumber}
                  </span>
                </div>
              </div>

              {/* Lista de Atletas no Bloco */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {levelPlayers.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-xl border border-slate-800/40">
                    Nenhum atleta alocado neste nível no momento.
                  </div>
                ) : (
                  levelPlayers.map((player) => {
                    const isCurrentUser = currentUser?.id === player.id;
                    const canChallenge = currentUser && !isCurrentUser;

                    const totalMatches = player.wins + player.losses;
                    const winRate = totalMatches > 0 ? Math.round((player.wins / totalMatches) * 100) : 0;
                    
                    const pointDiff = player.pointDiff !== undefined 
                      ? player.pointDiff 
                      : ((player.pointsScored || 0) - (player.pointsConceded || 0));

                    const formattedPointDiff = pointDiff >= 0 ? `+${pointDiff}` : `${pointDiff}`;

                    return (
                      <div
                        key={player.id}
                        className={`relative rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between gap-4 ${
                          isCurrentUser
                            ? 'bg-orange-950/30 border-orange-500/50 shadow-lg shadow-orange-950/40'
                            : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Linha Superior: Rank, Nome e Badges */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            {/* Posição / Rank Badge */}
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-xl text-xs font-black tracking-tight border flex items-center gap-1 ${
                                player.rank === 1
                                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/40'
                                  : player.rank === 2
                                  ? 'bg-slate-400/20 text-slate-200 border-slate-400/40'
                                  : player.rank === 3
                                  ? 'bg-amber-700/20 text-amber-600 border-amber-700/40'
                                  : 'bg-slate-900 text-slate-300 border-slate-800'
                              }`}>
                                {player.rank === 1 && <Medal className="w-3.5 h-3.5 text-amber-400" />}
                                Rank #{player.rank}
                              </span>

                              {player.role === 'admin' && (
                                <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-purple-400" /> Admin
                                </span>
                              )}
                            </div>

                            {/* Indicador de Perfil Próprio */}
                            {isCurrentUser && (
                              <span className="text-[10px] bg-orange-600 text-white font-bold px-2 py-0.5 rounded-full shadow">
                                Você
                              </span>
                            )}
                          </div>

                          {/* Nome do Atleta */}
                          <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                            {player.name}
                          </h4>
                          {player.phone && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {formatPhoneDisplay(player.phone)}
                            </p>
                          )}
                        </div>

                        {/* Estatísticas de Desempenho */}
                        <div className="grid grid-cols-4 gap-1 bg-slate-900/90 rounded-xl p-2 border border-slate-800/80 text-center">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Vitórias</span>
                            <span className="text-xs font-black text-emerald-400">{player.wins}V</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Derrotas</span>
                            <span className="text-xs font-black text-rose-400">{player.losses}D</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Aprv.</span>
                            <span className="text-xs font-black text-blue-400">{winRate}%</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Saldo</span>
                            <span className={`text-xs font-black ${pointDiff >= 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                              {formattedPointDiff}
                            </span>
                          </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
                          {canChallenge && (
                            <button
                              onClick={() => {
                                setPreselectedChallenged(player);
                                setIsNewChallengeModalOpen(true);
                              }}
                              className="flex-1 py-1.5 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Swords className="w-3.5 h-3.5" /> Desafiar
                            </button>
                          )}

                          {(isAdmin || isCurrentUser) && (
                            <button
                              onClick={() => {
                                setSelectedPlayerToEdit(player);
                                setIsEditPlayerModalOpen(true);
                              }}
                              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-colors"
                              title="Editar Dados do Atleta"
                            >
                              Editar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
