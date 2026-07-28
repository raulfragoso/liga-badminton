import React, { useState, useEffect } from 'react';
import { Player, Challenge, LeagueSettings } from './types/league';
import { INITIAL_PLAYERS, INITIAL_CHALLENGES, INITIAL_SETTINGS } from './data/initialData';
import { PyramidView } from './components/PyramidView';
import { NewChallengeModal } from './components/NewChallengeModal';
import { MatchResultModal } from './components/MatchResultModal';
import { formatPhoneDisplay } from './utils/auth';
import { MatchHistory } from './components/MatchHistory';
import { PlayerManagementModal } from './components/PlayerManagementModal';
import { RulesModal } from './components/RulesModal';
import { ResetLeagueModal } from './components/ResetLeagueModal';
import { EditPlayerModal } from './components/EditPlayerModal';
import { LoginModal } from './components/LoginModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { getQuarterEndCountdown, recalculatePlayerStats } from './utils/leagueRules';
import { 
  Trophy, 
  Swords, 
  Users, 
  BookOpen, 
  Plus, 
  RotateCcw, 
  Calendar, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Pencil,
  LogIn,
  LogOut,
  Trash2
} from 'lucide-react';

export const App: React.FC = () => {
  // Estado com persistência LocalStorage
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('badminton_players');
    if (saved !== null) {
      try {
        const loaded: Player[] = JSON.parse(saved);
        if (loaded && loaded.length > 0) {
          if (!loaded.some(p => p.role === 'admin')) {
            loaded[0].role = 'admin';
            loaded[0].password = loaded[0].password || 'admin';
          }
        }
        return loaded;
      } catch (e) {
        return INITIAL_PLAYERS;
      }
    }
    return INITIAL_PLAYERS;
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('badminton_challenges');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CHALLENGES;
      }
    }
    return INITIAL_CHALLENGES;
  });

  const [settings, setSettings] = useState<LeagueSettings>(() => {
    const saved = localStorage.getItem('badminton_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Usuário Autenticado (Padrão: Gabriel Santos - Admin)
  const [currentUser, setCurrentUser] = useState<Player | null>(() => {
    const saved = localStorage.getItem('badminton_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return INITIAL_PLAYERS[0]; // Gabriel Santos (Admin) por padrão
  });

  const [activeTab, setActiveTab] = useState<'pyramid' | 'history' | 'players'>('pyramid');

  // Modais
  const [isNewChallengeModalOpen, setIsNewChallengeModalOpen] = useState(false);
  const [isMatchResultModalOpen, setIsMatchResultModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isResetLeagueModalOpen, setIsResetLeagueModalOpen] = useState(false);
  const [isEditPlayerModalOpen, setIsEditPlayerModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [preselectedChallenger, setPreselectedChallenger] = useState<Player | null>(null);
  const [selectedChallengeToResolve, setSelectedChallengeToResolve] = useState<Challenge | null>(null);
  const [selectedPlayerToEdit, setSelectedPlayerToEdit] = useState<Player | null>(null);

  // Toast Notificação
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'warning' } | null>(null);

  // Salvar alterações no localStorage
  useEffect(() => {
    localStorage.setItem('badminton_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('badminton_challenges', JSON.stringify(challenges));
    // Sincronizar automaticamente o número real de vitórias/derrotas de todos os atletas
    setPlayers(prevPlayers => recalculatePlayerStats(prevPlayers, challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem('badminton_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('badminton_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('badminton_current_user');
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: Player) => {
    setCurrentUser(user);
    showToast(
      `Bem-vindo(a), ${user.name}!`,
      user.role === 'admin'
        ? 'Você está conectado com privilégios de Administrador.'
        : 'Você está conectado como Atleta.',
      'success'
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Sessão Encerrada', 'Você saiu da sua conta.', 'warning');
  };

  const isAdmin = currentUser?.role === 'admin';

  // Handler para Resetar Dados para a Demonstração Inicial
  const handleResetData = () => {
    if (window.confirm('Deseja resetar todos os dados para o estado inicial de demonstração?')) {
      setPlayers(INITIAL_PLAYERS);
      setChallenges(INITIAL_CHALLENGES);
      setSettings(INITIAL_SETTINGS);
      setCurrentUser(INITIAL_PLAYERS[0]);
      localStorage.setItem('badminton_players', JSON.stringify(INITIAL_PLAYERS));
      localStorage.setItem('badminton_challenges', JSON.stringify(INITIAL_CHALLENGES));
      localStorage.setItem('badminton_settings', JSON.stringify(INITIAL_SETTINGS));
      localStorage.setItem('badminton_current_user', JSON.stringify(INITIAL_PLAYERS[0]));
      showToast('Dados Resetados', 'A liga foi restaurada para a demonstração inicial.', 'warning');
    }
  };

  // Handler para Remover Todos os Dados da Demonstração Inicial
  const handleClearAllData = () => {
    if (window.confirm('Tem certeza que deseja REMOVER TODOS os registros de atletas e jogos da demonstração? A aplicação ficará limpa.')) {
      setPlayers([]);
      setChallenges([]);
      setCurrentUser(null);
      localStorage.setItem('badminton_players', JSON.stringify([]));
      localStorage.setItem('badminton_challenges', JSON.stringify([]));
      localStorage.removeItem('badminton_current_user');
      showToast('Dados Removidos', 'Todos os registros de atletas e jogos foram completamente limpos da aplicação.', 'warning');
    }
  };

  const showToast = (title: string, desc: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Criar Novo Desafio
  const handleSaveChallenge = (newChallenge: Challenge) => {
    setChallenges(prev => [newChallenge, ...prev]);
    
    // Marcar que o desafiante usou o desafio da semana
    setPlayers(prev => prev.map(p => {
      if (p.id === newChallenge.challengerId) {
        return { ...p, lastChallengeWeek: settings.currentWeek };
      }
      return p;
    }));

    showToast('Desafio Criado!', `Desafio entre ${newChallenge.challengerName} e ${newChallenge.challengedName} registrado com sucesso.`);
  };

  // Concluir Jogo e Atualizar Pirâmide
  const handleCompleteMatch = (
    completedChallenge: Challenge,
    updatedPlayers: Player[],
    summaryMessage: string
  ) => {
    setChallenges(prev => {
      const nextChallenges = prev.map(c => c.id === completedChallenge.id ? completedChallenge : c);
      setPlayers(recalculatePlayerStats(updatedPlayers, nextChallenges));
      return nextChallenges;
    });
    showToast('Resultado Processado e Pirâmide Atualizada!', summaryMessage, 'success');
  };

  // Adicionar Atleta
  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers(prev => [...prev, newPlayer]);
    showToast('Atleta Cadastrado', `${newPlayer.name} ingressou na pirâmide no Rank #${newPlayer.rank}.`);
  };

  // Salvar Alterações do Atleta
  const handleSavePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    showToast('Atleta Atualizado!', `Dados de ${updatedPlayer.name} atualizados com sucesso.`);
  };

  // Excluir Atleta
  const handleDeletePlayer = (playerId: string) => {
    const deletedPlayer = players.find(p => p.id === playerId);
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    showToast('Atleta Removido', `O atleta ${deletedPlayer?.name || ''} foi removido da liga.`, 'warning');
  };

  // Resetar Liga / Iniciar Nova Temporada com Novas Datas
  const handleResetLeague = (
    newStartDate: string,
    newEndDate: string,
    newSeasonName?: string
  ) => {
    // 1. Zerar todos os jogos / desafios
    setChallenges([]);

    // 2. Zerar estatísticas dos atletas, reiniciar níveis para Nível 1 e Rank #1
    setPlayers(prev => prev.map(p => ({
      ...p,
      rank: 1,
      level: 1, // Todos os atletas iniciam no Nível 1
      wins: 0,
      losses: 0,
      status: 'active',
      cooldownUntil: undefined,
      cooldownReason: undefined,
      lastChallengeWeek: undefined
    })));

    // 3. Atualizar configurações da liga (novas datas, semana 1, nome)
    setSettings(prev => ({
      ...prev,
      name: newSeasonName || prev.name,
      seasonStartDate: newStartDate,
      seasonEndDate: newEndDate,
      currentWeek: 1
    }));

    const formattedStart = new Date(newStartDate).toLocaleDateString('pt-BR');
    const formattedEnd = new Date(newEndDate).toLocaleDateString('pt-BR');

    showToast(
      'Nova Temporada Iniciada!',
      `Todos os jogos foram zerados. Período agendado de ${formattedStart} a ${formattedEnd}.`,
      'success'
    );
  };

  const countdown = getQuarterEndCountdown(settings.seasonEndDate);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Banner de Instalação do App PWA no Celular */}
      <PWAInstallPrompt />

      {/* Toast Floating Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border border-orange-500/40 text-slate-100 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-start gap-3 animate-bounce">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="font-bold text-sm text-white">{toastMessage.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* HEADER / NAVBAR PRINCIPAL */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo Oficial Maylson Campos e Título */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center border-2 border-orange-500/60 shadow-xl shadow-orange-500/25 overflow-hidden p-1 shrink-0">
              <img 
                src="/logo-maylson.png" 
                alt="Complexo Esportivo Maylson Campos Logo" 
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Liga de Badminton
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40">
                  Maylson Campos
                </span>
              </h1>
              <p className="text-xs text-slate-400">Sistema Oficial de Desafios e Ranking em Pirâmide</p>
            </div>
          </div>

          {/* Navegação por Abas */}
          <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('pyramid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'pyramid'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Pirâmide Geral
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Swords className="w-4 h-4" />
              Desafios ({challenges.filter(c => c.status === 'pending').length} Pendentes)
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'players'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              Atletas ({players.length})
            </button>
          </nav>

          {/* Ações Rápidas & Perfil do Usuário */}
          <div className="flex items-center gap-3">
            {/* Widget de Perfil do Usuário Logado */}
            {currentUser ? (
              <div className="flex items-center gap-2.5 bg-slate-900/90 p-1.5 pr-3 rounded-2xl border border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center font-bold text-orange-400 text-xs">
                  {currentUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1 leading-tight">
                    {currentUser.name}
                    {currentUser.role === 'admin' ? (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        Admin
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Atleta
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{currentUser.phone ? formatPhoneDisplay(currentUser.phone) : 'Sem fone'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-1 p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                Entrar / Login
              </button>
            )}

            {/* Novo Desafio */}
            <button
              onClick={() => {
                if (!currentUser) {
                  setIsLoginModalOpen(true);
                  return;
                }
                setPreselectedChallenger(currentUser.role === 'athlete' ? currentUser : null);
                setIsNewChallengeModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Novo Desafio
            </button>

            {/* Regulamento */}
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors flex items-center gap-1"
              title="Ver Regulamento Oficial"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Zerar Liga (Visível Apenas para Administrador) */}
            {isAdmin && (
              <button
                onClick={() => setIsResetLeagueModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                title="Zerar Jogos e Iniciar Nova Temporada (Administrador)"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Zerar Liga</span>
              </button>
            )}

            {/* Reset de Demonstração */}
            {isAdmin && (
              <button
                onClick={handleResetData}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors"
                title="Restaurar Dados da Demonstração Inicial"
              >
                <RotateCcw className="w-3.5 h-3.5 opacity-60" />
              </button>
            )}

            {/* Remover Dados da Demonstração Inicial */}
            {isAdmin && (
              <button
                onClick={handleClearAllData}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-colors"
                title="Remover Dados da Demonstração Inicial (Limpar Todos os Registros)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL DA PÁGINA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center gap-8">
        {/* Banner de Status do Período de 3 Meses / Premiação */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Fim da Liga (3 Meses)</span>
              <p className="text-sm font-bold text-white">{countdown.daysLeft} dias restantes ({countdown.formattedEndDate})</p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/30 text-orange-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Líder Atual da Liga</span>
              <p className="text-sm font-bold text-orange-400">
                {players.find(p => p.rank === 1)?.name || 'Sem Atleta'} (Nível 1)
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30 text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Atletas Cadastrados</span>
              <p className="text-sm font-bold text-white">{players.length} Atletas em {Math.max(...players.map(p => p.level))} Níveis</p>
            </div>
          </div>
        </div>

        {/* Renderização da Aba Ativa */}
        {activeTab === 'pyramid' && (
          <PyramidView
            players={players}
            challenges={challenges}
            currentWeek={settings.currentWeek}
            onSelectPlayerToChallenge={(player) => {
              setPreselectedChallenger(player);
              setIsNewChallengeModalOpen(true);
            }}
            onSelectChallengeToResolve={(challenge) => {
              setSelectedChallengeToResolve(challenge);
              setIsMatchResultModalOpen(true);
            }}
            onOpenPlayerDetails={(player) => {
              setSelectedPlayerToEdit(player);
              setIsEditPlayerModalOpen(true);
            }}
          />
        )}

        {activeTab === 'history' && (
          <MatchHistory
            challenges={challenges}
            onSelectChallengeToResolve={(challenge) => {
              setSelectedChallengeToResolve(challenge);
              setIsMatchResultModalOpen(true);
            }}
          />
        )}

        {activeTab === 'players' && (
          <div className="w-full max-w-5xl glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Quadro de Atletas Ranqueados</h3>
                <p className="text-xs text-slate-400">Lista ordenada por rank e nível atual na liga</p>
              </div>
              <button
                onClick={() => setIsPlayerModalOpen(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Cadastrar Atleta
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Nível</th>
                    <th className="p-3">Atleta</th>
                    <th className="p-3">Telefone</th>
                    <th className="p-3">Vitórias</th>
                    <th className="p-3">Derrotas</th>
                    <th className="p-3">Aproveitamento</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {players.map((p) => {
                    const totalGames = p.wins + p.losses;
                    const winRate = totalGames > 0 ? Math.round((p.wins / totalGames) * 100) : 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3 font-bold text-orange-400">#{p.rank}</td>
                        <td className="p-3 font-semibold text-slate-400">Nível {p.level}</td>
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                            {p.name.substring(0, 2).toUpperCase()}
                          </div>
                          {p.name}
                        </td>
                        <td className="p-3 text-slate-400 font-mono">{p.phone ? formatPhoneDisplay(p.phone) : 'Não informado'}</td>
                        <td className="p-3 text-orange-400 font-bold">{p.wins}</td>
                        <td className="p-3 text-rose-400 font-bold">{p.losses}</td>
                        <td className="p-3 font-semibold">{winRate}%</td>
                        <td className="p-3">
                          {p.status === 'cooldown' ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] border border-rose-500/30">
                              Suspenso (2 sem)
                            </span>
                          ) : p.status === 'injured' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30">
                              Lesionado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] border border-orange-500/30">
                              Ativo
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedPlayerToEdit(p);
                              setIsEditPlayerModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-orange-400 border border-slate-800 transition-colors inline-flex items-center gap-1 text-xs"
                            title="Editar Atleta"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>Liga de Badminton do Complexo Esportivo Maylson Campos • Regulamento FEBASP</p>
      </footer>

      {/* MODAIS DA APLICAÇÃO */}
      <NewChallengeModal
        isOpen={isNewChallengeModalOpen}
        onClose={() => {
          setIsNewChallengeModalOpen(false);
          setPreselectedChallenger(null);
        }}
        players={players}
        challenges={challenges}
        currentWeek={settings.currentWeek}
        preselectedChallenger={preselectedChallenger}
        onSaveChallenge={handleSaveChallenge}
      />

      <MatchResultModal
        isOpen={isMatchResultModalOpen}
        onClose={() => {
          setIsMatchResultModalOpen(false);
          setSelectedChallengeToResolve(null);
        }}
        challenge={selectedChallengeToResolve}
        players={players}
        onCompleteMatch={handleCompleteMatch}
      />

      <PlayerManagementModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        players={players}
        onAddPlayer={handleAddPlayer}
      />

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <ResetLeagueModal
        isOpen={isResetLeagueModalOpen}
        onClose={() => setIsResetLeagueModalOpen(false)}
        currentSettings={settings}
        onResetLeague={handleResetLeague}
      />

      <EditPlayerModal
        isOpen={isEditPlayerModalOpen}
        onClose={() => {
          setIsEditPlayerModalOpen(false);
          setSelectedPlayerToEdit(null);
        }}
        player={selectedPlayerToEdit}
        onSavePlayer={handleSavePlayer}
        onDeletePlayer={handleDeletePlayer}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        players={players}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
