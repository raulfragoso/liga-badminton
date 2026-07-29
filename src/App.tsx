import React, { useState, useEffect } from 'react';
import { Player, Challenge, LeagueSettings } from './types/league';
import { INITIAL_SETTINGS } from './data/initialData';
import { PyramidView } from './components/PyramidView';
import { LevelListView } from './components/LevelListView';
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
import { getQuarterEndCountdown, recalculatePlayerStats, getLeagueLeader } from './utils/leagueRules';
import { 
  Trophy, 
  Layers,
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
  Download,
  Upload,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { 
  isSupabaseConfigured, 
  fetchPlayersFromSupabase, 
  saveAllPlayersToSupabase, 
  saveSinglePlayerToSupabase,
  deletePlayerFromSupabase,
  fetchChallengesFromSupabase, 
  saveSingleChallengeToSupabase,
  fetchSettingsFromSupabase,
  saveSettingsToSupabase,
  subscribeToSupabaseRealtime, 
  deleteChallengeFromSupabase
} from './utils/supabaseClient';

export const App: React.FC = () => {
  // Estado com persistência LocalStorage (inicia limpo até sincronizar com o banco)
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('badminton_players');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('badminton_challenges');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [settings, setSettings] = useState<LeagueSettings>(() => {
    const saved = localStorage.getItem('badminton_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Usuário Autenticado (Padrão: Nenhum usuário logado por padrão)
  const [currentUser, setCurrentUser] = useState<Player | null>(() => {
    const saved = localStorage.getItem('badminton_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null; // Nenhum usuário logado automaticamente ao abrir
  });

  const [activeTab, setActiveTab] = useState<'pyramid' | 'levels' | 'history' | 'players'>('levels');

  // Modais
  const [isNewChallengeModalOpen, setIsNewChallengeModalOpen] = useState(false);
  const [isMatchResultModalOpen, setIsMatchResultModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isResetLeagueModalOpen, setIsResetLeagueModalOpen] = useState(false);
  const [isEditPlayerModalOpen, setIsEditPlayerModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [preselectedChallenger, setPreselectedChallenger] = useState<Player | null>(null);
  const [preselectedChallenged, setPreselectedChallenged] = useState<Player | null>(null);
  const [selectedChallengeToResolve, setSelectedChallengeToResolve] = useState<Challenge | null>(null);
  const [selectedPlayerToEdit, setSelectedPlayerToEdit] = useState<Player | null>(null);

  // Toast Notificação
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'warning' } | null>(null);

  // Sincronização inicial e Realtime com o Supabase (banco em nuvem compartilhado)
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Carregar atletas, desafios e configurações da liga da nuvem ao iniciar
    Promise.all([
      fetchPlayersFromSupabase(),
      fetchChallengesFromSupabase(),
      fetchSettingsFromSupabase()
    ]).then(([cloudPlayers, cloudChallenges, cloudSettings]) => {
      const loadedChallenges = (cloudChallenges !== null && cloudChallenges.length > 0) ? cloudChallenges : [];
      if (cloudChallenges !== null && cloudChallenges.length > 0) {
        setChallenges(cloudChallenges);
        localStorage.setItem('badminton_challenges', JSON.stringify(cloudChallenges));
      }
      if (cloudPlayers !== null && cloudPlayers.length > 0) {
        const recalculated = recalculatePlayerStats(cloudPlayers, loadedChallenges);
        setPlayers(recalculated);
        localStorage.setItem('badminton_players', JSON.stringify(recalculated));
      }
      if (cloudSettings !== null) {
        setSettings(cloudSettings);
        localStorage.setItem('badminton_settings', JSON.stringify(cloudSettings));
      }
    }).catch(err => {
      console.error("Erro no carregamento inicial do Supabase:", err);
    });

    // Assinar atualizações Realtime para atualizar instantaneamente o celular de todos os atletas
    const unsubscribe = subscribeToSupabaseRealtime(
      (updatedPlayers) => {
        setPlayers(updatedPlayers);
        localStorage.setItem('badminton_players', JSON.stringify(updatedPlayers));
      },
      (updatedChallenges) => {
        setChallenges(updatedChallenges);
        localStorage.setItem('badminton_challenges', JSON.stringify(updatedChallenges));
      },
      (updatedSettings) => {
        setSettings(updatedSettings);
        localStorage.setItem('badminton_settings', JSON.stringify(updatedSettings));
      }
    );

    return () => unsubscribe();
  }, []);

  // Salvar alterações locais no localStorage
  useEffect(() => {
    localStorage.setItem('badminton_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('badminton_challenges', JSON.stringify(challenges));
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



  // Exportar dados da Liga em arquivo JSON
  const handleExportData = () => {
    const backupData = {
      players,
      challenges,
      settings,
      exportedAt: new Date().toISOString()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup-liga-badminton-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup Exportado!', 'Arquivo JSON com os atletas e jogos foi baixado.', 'success');
  };

  // Importar dados da Liga a partir de um arquivo JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.players && Array.isArray(parsed.players)) {
            setPlayers(parsed.players);
            if (parsed.challenges && Array.isArray(parsed.challenges)) setChallenges(parsed.challenges);
            if (parsed.settings) setSettings(parsed.settings);
            localStorage.setItem('badminton_players', JSON.stringify(parsed.players));
            localStorage.setItem('badminton_challenges', JSON.stringify(parsed.challenges || []));
            if (parsed.settings) localStorage.setItem('badminton_settings', JSON.stringify(parsed.settings));
            showToast('Dados Importados!', `${parsed.players.length} atletas carregados na aplicação com sucesso.`, 'success');
          } else {
            showToast('Arquivo Inválido', 'O arquivo selecionado não possui o formato de dados válido da liga.', 'warning');
          }
        } catch (err) {
          showToast('Erro ao Importar', 'Não foi possível ler o arquivo JSON.', 'warning');
        }
      };
    }
  };

  const showToast = (title: string, desc: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Criar Novo Desafio
  const handleSaveChallenge = (newChallenge: Challenge) => {
    setChallenges(prev => [newChallenge, ...prev]);
    if (isSupabaseConfigured) {
      saveSingleChallengeToSupabase(newChallenge);
    }
    
    // Marcar que o desafiante usou o desafio da semana
    setPlayers(prev => prev.map(p => {
      if (p.id === newChallenge.challengerId) {
        const updated = { ...p, lastChallengeWeek: settings.currentWeek };
        if (isSupabaseConfigured) {
          saveSinglePlayerToSupabase(updated);
        }
        return updated;
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
      const recalculated = recalculatePlayerStats(updatedPlayers, nextChallenges);
      setPlayers(recalculated);
      if (isSupabaseConfigured) {
        saveSingleChallengeToSupabase(completedChallenge);
        saveAllPlayersToSupabase(recalculated);
      }
      return nextChallenges;
    });
    showToast('Resultado Processado e Pirâmide Atualizada!', summaryMessage, 'success');
  };

  // Adicionar Atleta
  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers(prev => [...prev, newPlayer]);
    if (isSupabaseConfigured) {
      saveSinglePlayerToSupabase(newPlayer);
    }
    showToast('Atleta Cadastrado', `${newPlayer.name} ingressou na pirâmide no Rank #${newPlayer.rank}.`);
  };

  // Salvar Alterações do Atleta
  const handleSavePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    if (isSupabaseConfigured) {
      saveSinglePlayerToSupabase(updatedPlayer);
    }
    showToast('Atleta Atualizado!', `Dados de ${updatedPlayer.name} atualizados com sucesso.`);
  };

  // Excluir Atleta
  const handleDeletePlayer = (playerId: string) => {
    const deletedPlayer = players.find(p => p.id === playerId);
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    if (isSupabaseConfigured) {
      deletePlayerFromSupabase(playerId);
    }
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
    const newSettings: LeagueSettings = {
      ...settings,
      name: newSeasonName || settings.name,
      seasonStartDate: newStartDate,
      seasonEndDate: newEndDate,
      currentWeek: 1
    };
    setSettings(newSettings);

    if (isSupabaseConfigured) {
      saveSettingsToSupabase(newSettings);
    }

    const formattedStart = new Date(newStartDate).toLocaleDateString('pt-BR');
    const formattedEnd = new Date(newEndDate).toLocaleDateString('pt-BR');

    showToast(
      'Nova Temporada Iniciada!',
      `Todos os jogos foram zerados. Período agendado de ${formattedStart} a ${formattedEnd}.`,
      'success'
    );
  };

  const handleDeleteChallenge = (challengeId: string) => {
    const challengeToDelete = challenges.find(c => c.id === challengeId);
    const updatedChallenges = challenges.filter(c => c.id !== challengeId);

    setChallenges(updatedChallenges);
    localStorage.setItem('badminton_challenges', JSON.stringify(updatedChallenges));
    deleteChallengeFromSupabase(challengeId);

    // Se o desafio excluído pertencia ao desafiante na semana atual, restaura a disponibilidade do atleta
    if (challengeToDelete) {
      const challengerId = challengeToDelete.challengerId;
      const hasOtherChallengeThisWeek = updatedChallenges.some(
        c => c.weekNumber === settings.currentWeek && c.challengerId === challengerId
      );

      if (!hasOtherChallengeThisWeek) {
        const updatedPlayers = players.map(p => {
          if (p.id === challengerId) {
            const updated = { ...p };
            delete updated.lastChallengeWeek;
            return updated;
          }
          return p;
        });

        setPlayers(updatedPlayers);
        localStorage.setItem('badminton_players', JSON.stringify(updatedPlayers));
        saveAllPlayersToSupabase(updatedPlayers);
      }
    }

    showToast(
      'Desafio Cancelado',
      'O desafio foi excluído e o desafiante está 100% liberado para realizar um novo desafio nesta semana!',
      'warning'
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
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
          
          {/* LINHA 1: BRANDING + PERFIL DO USUÁRIO + BOTÕES DE AÇÃO */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Esquerda: Logo Oficial e Título */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-orange-500/60 shadow-lg shadow-orange-500/20 overflow-hidden p-0.5 shrink-0">
                <img 
                  src="/logo-maylson.png" 
                  alt="Complexo Esportivo Maylson Campos Logo" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                  Liga de Badminton
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">Complexo Esportivo Maylson Campos</p>
              </div>
            </div>

            {/* Direita: Perfil + Ações Rápidas Unificadas */}
            <div className="flex items-center gap-2.5 ml-auto">
              {currentUser ? (
                <>
                  {/* Widget do Perfil do Atleta */}
                  <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
                    <div className="w-7 h-7 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center font-bold text-orange-400 text-xs">
                      {currentUser.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5 whitespace-nowrap">
                        {currentUser.name}
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                          currentUser.role === 'admin' 
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {currentUser.role === 'admin' ? 'Admin' : 'Atleta'}
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="ml-1 p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Sair da Conta"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* CTA Principal: Novo Desafio */}
                  <button
                    onClick={() => {
                      setPreselectedChallenger(currentUser || null);
                      setPreselectedChallenged(null);
                      setIsNewChallengeModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Novo Desafio</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </button>
              )}

              {/* Toolbar Auxiliar: Regulamento & Ferramentas do Admin */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setIsRulesModalOpen(true)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                  title="Ver Regulamento Oficial"
                >
                  <BookOpen className="w-4 h-4 text-slate-400 hover:text-white" />
                </button>

                {isAdmin && (
                  <>
                    <button
                      onClick={() => setIsResetLeagueModalOpen(true)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Zerar Jogos e Iniciar Nova Temporada (Admin)"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleExportData}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-emerald-400 transition-colors"
                      title="Exportar Backup dos Atletas (Arquivo JSON)"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <label
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-cyan-400 transition-colors cursor-pointer"
                      title="Importar Backup dos Atletas (Arquivo JSON)"
                    >
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* LINHA 2: NAVEGAÇÃO SEGMENTADA POR ABAS */}
          {currentUser && (
            <div className="flex items-center justify-start overflow-x-auto pt-1 border-t border-slate-900/90 no-scrollbar">
              <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80">
                <button
                  onClick={() => setActiveTab('levels')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'levels'
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Lista por Níveis
                </button>

                <button
                  onClick={() => setActiveTab('pyramid')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'pyramid'
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Pirâmide
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'history'
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  Desafios ({challenges.filter(c => c.status === 'pending').length})
                </button>

                <button
                  onClick={() => setActiveTab('players')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'players'
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Atletas ({players.length})
                </button>
              </nav>
            </div>
          )}

        </div>
      </header>

        {/* CONTEÚDO PRINCIPAL DA PÁGINA */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center">
          {!currentUser ? (
            /* BARREIRA DE AUTENTICAÇÃO - NENHUM DADO EXIBIDO SEM AUTENTICAÇÃO */
            <div className="w-full max-w-md my-auto py-10 animate-fadeIn flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-orange-600/10 border-2 border-orange-500/30 flex items-center justify-center text-orange-400 mb-6 shadow-xl shadow-orange-600/10">
                <Lock className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-2">Acesso Restrito aos Atletas</h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-sm leading-relaxed">
                Para visualizar a pirâmide de posições, histórico de confrontos e lista de atletas da liga, faça login com seu telefone e senha.
              </p>

              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5"
              >
                <LogIn className="w-5 h-5" />
                Entrar no Sistema da Liga
              </button>

              <div className="mt-8 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 max-w-sm text-left flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200 block mb-0.5">Segurança dos Dados:</span>
                  Todas as estatísticas, rankings e contatos da liga são visíveis exclusivamente para atletas autenticados.
                </div>
              </div>
            </div>
          ) : (
            /* DADOS DA LIGA (EXIBIDOS EXCLUSIVAMENTE APÓS AUTENTICAÇÃO) */
            <div className="w-full space-y-6">
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
                      {(() => {
                        const leader = getLeagueLeader(players, challenges);
                        if (!leader) return 'Sem Atleta Cadastrado';
                        const pointDiff = (leader.pointDiff !== undefined) ? leader.pointDiff : ((leader.pointsScored || 0) - (leader.pointsConceded || 0));
                        const diffStr = pointDiff >= 0 ? `+${pointDiff}` : `${pointDiff}`;
                        return `${leader.name} (${leader.wins} Vitórias | Saldo: ${diffStr} pts)`;
                      })()}
                    </p>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30 text-blue-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Atletas Cadastrados</span>
                    <p className="text-sm font-bold text-white">{players.length} Atletas em {players.length > 0 ? Math.max(...players.map(p => p.level)) : 1} Níveis</p>
                  </div>
                </div>
              </div>

              {/* Renderização da Aba Ativa */}
              {activeTab === 'pyramid' && (
                <PyramidView
                  players={players}
                  challenges={challenges}
                  currentWeek={settings.currentWeek}
                  currentUser={currentUser}
                  onSelectPlayerToChallenge={(player) => {
                    setPreselectedChallenger(currentUser || null);
                    setPreselectedChallenged(player);
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

              {activeTab === 'levels' && (
                <LevelListView
                  players={players}
                  challenges={challenges}
                  currentUser={currentUser}
                  onSelectPlayerToChallenge={(player) => {
                    setPreselectedChallenger(currentUser || null);
                    setPreselectedChallenged(player);
                    setIsNewChallengeModalOpen(true);
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
                  players={players}
                  currentUser={currentUser}
                  onSelectChallengeToResolve={(challenge) => {
                    setSelectedChallengeToResolve(challenge);
                    setIsMatchResultModalOpen(true);
                  }}
                  onDeleteChallenge={handleDeleteChallenge}
                />
              )}

              {activeTab === 'players' && (
                <div className="w-full max-w-5xl glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Quadro de Atletas Ranqueados</h3>
                      <p className="text-xs text-slate-400">Lista ordenada por rank e nível atual na liga</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => setIsPlayerModalOpen(true)}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Cadastrar Atleta
                      </button>
                    )}
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
                          const canEditThisPlayer = isAdmin || currentUser?.id === p.id;

                          return (
                            <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                              <td className="p-3 font-bold text-orange-400">#{p.rank}</td>
                              <td className="p-3 font-bold text-slate-100">Nível {p.level}</td>
                              <td className="p-3 font-medium text-white">{p.name}</td>
                              <td className="p-3 font-mono">{p.phone ? formatPhoneDisplay(p.phone) : '—'}</td>
                              <td className="p-3 text-emerald-400 font-bold">{p.wins}</td>
                              <td className="p-3 text-rose-400 font-bold">{p.losses}</td>
                              <td className="p-3 font-bold">{winRate}%</td>
                              <td className="p-3">
                                {p.status === 'cooldown' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                    Suspenso (Cooldown)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                    Ativo
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                {canEditThisPlayer ? (
                                  <button
                                    onClick={() => {
                                      setSelectedPlayerToEdit(p);
                                      setIsEditPlayerModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-orange-400 border border-slate-800 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                                    title={isAdmin ? "Editar Atleta" : "Editar Meu Perfil"}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>{currentUser?.id === p.id ? "Meu Perfil" : "Editar"}</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-600 font-mono">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
          setPreselectedChallenged(null);
        }}
        players={players}
        challenges={challenges}
        currentWeek={settings.currentWeek}
        currentUser={currentUser}
        preselectedChallenger={preselectedChallenger}
        preselectedChallenged={preselectedChallenged}
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
        onDeleteChallenge={handleDeleteChallenge}
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
        currentUser={currentUser}
        onSavePlayer={handleSavePlayer}
        onDeletePlayer={handleDeletePlayer}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        players={players}
        onLoginSuccess={handleLoginSuccess}
        onUpdatePlayers={setPlayers}
      />
    </div>
  );
};

export default App;
