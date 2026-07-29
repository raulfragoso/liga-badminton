import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player, Challenge, LeagueSettings } from '../types/league';
import { INITIAL_SETTINGS } from '../data/initialData';
import { recalculatePlayerStats } from '../utils/leagueRules';
import {
  fetchPlayersFromSupabase,
  fetchChallengesFromSupabase,
  fetchSettingsFromSupabase,
  subscribeToSupabaseRealtime,
  isSupabaseConfigured,
  saveSingleChallengeToSupabase,
  saveSinglePlayerToSupabase,
  saveAllPlayersToSupabase,
  deletePlayerFromSupabase,
  deleteChallengeFromSupabase,
  saveSettingsToSupabase
} from '../utils/supabaseClient';

interface ToastMessage {
  title: string;
  desc: string;
  type: 'success' | 'warning';
}

interface LeagueContextProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  challenges: Challenge[];
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  settings: LeagueSettings;
  setSettings: React.Dispatch<React.SetStateAction<LeagueSettings>>;
  
  currentUser: Player | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<Player | null>>;
  isAdmin: boolean;
  handleLoginSuccess: (user: Player) => void;
  handleLogout: () => void;

  // Modal states
  isNewChallengeModalOpen: boolean;
  setIsNewChallengeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMatchResultModalOpen: boolean;
  setIsMatchResultModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPlayerModalOpen: boolean;
  setIsPlayerModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isRulesModalOpen: boolean;
  setIsRulesModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isResetLeagueModalOpen: boolean;
  setIsResetLeagueModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditPlayerModalOpen: boolean;
  setIsEditPlayerModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Preselected Data
  preselectedChallenger: Player | null;
  setPreselectedChallenger: React.Dispatch<React.SetStateAction<Player | null>>;
  preselectedChallenged: Player | null;
  setPreselectedChallenged: React.Dispatch<React.SetStateAction<Player | null>>;
  selectedChallengeToResolve: Challenge | null;
  setSelectedChallengeToResolve: React.Dispatch<React.SetStateAction<Challenge | null>>;
  selectedPlayerToEdit: Player | null;
  setSelectedPlayerToEdit: React.Dispatch<React.SetStateAction<Player | null>>;

  toastMessage: ToastMessage | null;
  showToast: (title: string, desc: string, type?: 'success' | 'warning') => void;
  clearToast: () => void;

  // Actions
  handleExportData: () => void;
  handleImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveChallenge: (newChallenge: Challenge) => void;
  handleCompleteMatch: (completedChallenge: Challenge, updatedPlayers: Player[], summaryMessage: string) => void;
  handleAddPlayer: (newPlayer: Player) => void;
  handleSavePlayer: (updatedPlayer: Player) => void;
  handleDeletePlayer: (playerId: string) => void;
  handleDeleteChallenge: (challengeId: string) => void;
  handleResetLeague: (start: string, end: string, newSeasonName?: string) => void;
}

const LeagueContext = createContext<LeagueContextProps | undefined>(undefined);

export const LeagueProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('badminton_players');
    return saved ? JSON.parse(saved) : [];
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('badminton_challenges');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<LeagueSettings>(() => {
    const saved = localStorage.getItem('badminton_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [currentUser, setCurrentUser] = useState<Player | null>(() => {
    const saved = localStorage.getItem('badminton_current_user');
    return saved ? JSON.parse(saved) : null;
  });


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

  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 5000);
  };
  const clearToast = () => setToastMessage(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    Promise.all([
      fetchPlayersFromSupabase(),
      fetchChallengesFromSupabase(),
      fetchSettingsFromSupabase()
    ]).then(([cloudPlayers, cloudChallenges, cloudSettings]) => {
      const loadedChallenges = cloudChallenges || [];
      if (cloudChallenges?.length) {
        setChallenges(cloudChallenges);
      }
      if (cloudPlayers?.length) {
        const recalculated = recalculatePlayerStats(cloudPlayers, loadedChallenges);
        setPlayers(recalculated);
      }
      if (cloudSettings) {
        setSettings(cloudSettings);
      }
    }).catch(err => console.error("Erro no carregamento inicial do Supabase:", err));

    const unsubscribe = subscribeToSupabaseRealtime(
      (updatedPlayers) => setPlayers(updatedPlayers),
      (updatedChallenges) => setChallenges(updatedChallenges),
      (updatedSettings) => setSettings(updatedSettings)
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => { localStorage.setItem('badminton_players', JSON.stringify(players)); }, [players]);
  useEffect(() => { localStorage.setItem('badminton_challenges', JSON.stringify(challenges)); }, [challenges]);
  useEffect(() => { localStorage.setItem('badminton_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('badminton_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('badminton_current_user');
  }, [currentUser]);

  const handleLoginSuccess = (user: Player) => {
    setCurrentUser(user);
    showToast(
      `Bem-vindo(a), ${user.name}!`,
      user.role === 'admin' ? 'Conectado como Administrador.' : 'Conectado como Atleta.',
      'success'
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Sessão Encerrada', 'Você saiu da sua conta.', 'warning');
  };

  const handleExportData = () => {
    const backupData = { players, challenges, settings, exportedAt: new Date().toISOString() };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup-liga-badminton-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup Exportado!', 'Arquivo JSON com os atletas e jogos baixado.', 'success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files?.[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.players && Array.isArray(parsed.players)) {
            setPlayers(parsed.players);
            if (parsed.challenges) setChallenges(parsed.challenges);
            if (parsed.settings) setSettings(parsed.settings);
            showToast('Dados Importados!', `${parsed.players.length} atletas carregados.`, 'success');
          } else {
            showToast('Arquivo Inválido', 'O arquivo selecionado é inválido.', 'warning');
          }
        } catch (err) {
          showToast('Erro', 'Não foi possível ler o arquivo JSON.', 'warning');
        }
      };
    }
  };

  const handleSaveChallenge = (newChallenge: Challenge) => {
    setChallenges(prev => [newChallenge, ...prev]);
    if (isSupabaseConfigured) saveSingleChallengeToSupabase(newChallenge);
    
    setPlayers(prev => prev.map(p => {
      if (p.id === newChallenge.challengerId) {
        const updated = { ...p, lastChallengeWeek: settings.currentWeek };
        if (isSupabaseConfigured) saveSinglePlayerToSupabase(updated);
        return updated;
      }
      return p;
    }));
    showToast('Desafio Criado!', `Desafio entre ${newChallenge.challengerName} e ${newChallenge.challengedName} registrado.`);
  };

  const handleCompleteMatch = (completedChallenge: Challenge, updatedPlayers: Player[], summaryMessage: string) => {
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
    showToast('Pirâmide Atualizada!', summaryMessage, 'success');
  };

  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers(prev => [...prev, newPlayer]);
    if (isSupabaseConfigured) saveSinglePlayerToSupabase(newPlayer);
    showToast('Atleta Cadastrado', `${newPlayer.name} ingressou no Rank #${newPlayer.rank}.`);
  };

  const handleSavePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    if (isSupabaseConfigured) saveSinglePlayerToSupabase(updatedPlayer);
    showToast('Atualizado!', `Dados de ${updatedPlayer.name} atualizados com sucesso.`);
  };

  const handleDeletePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    if (isSupabaseConfigured) deletePlayerFromSupabase(playerId);
    showToast('Atleta Excluído', 'O atleta foi removido do ranking.', 'warning');
  };

  const handleDeleteChallenge = (challengeId: string) => {
    setChallenges(prev => prev.filter(c => c.id !== challengeId));
    if (isSupabaseConfigured) deleteChallengeFromSupabase(challengeId);
    showToast('Desafio Excluído', 'O desafio foi removido do sistema.', 'warning');
  };

  const handleResetLeague = (start: string, end: string, newSeasonName?: string) => {
    const resetPlayers = players.map(p => ({
      ...p,
      level: 1,
      wins: 0,
      losses: 0,
      status: 'active' as const,
      cooldownUntil: undefined,
      lastChallengeWeek: 0,
      history: []
    }));
    
    setPlayers(resetPlayers);
    setChallenges([]);
    const newSettings = {
      name: newSeasonName || settings.name,
      seasonStartDate: start,
      seasonEndDate: end,
      currentWeek: 1,
      maxRefusalsWithoutPenalty: settings.maxRefusalsWithoutPenalty
    };
    setSettings(newSettings);
    
    if (isSupabaseConfigured) {
      saveAllPlayersToSupabase(resetPlayers);
      saveSettingsToSupabase(newSettings);
    }
    showToast('Nova Temporada!', 'A liga foi zerada e uma nova temporada começou.', 'success');
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <LeagueContext.Provider
      value={{
        players, setPlayers, challenges, setChallenges, settings, setSettings,
        currentUser, setCurrentUser, isAdmin, handleLoginSuccess, handleLogout,
        isNewChallengeModalOpen, setIsNewChallengeModalOpen,
        isMatchResultModalOpen, setIsMatchResultModalOpen,
        isPlayerModalOpen, setIsPlayerModalOpen,
        isRulesModalOpen, setIsRulesModalOpen,
        isResetLeagueModalOpen, setIsResetLeagueModalOpen,
        isEditPlayerModalOpen, setIsEditPlayerModalOpen,
        isLoginModalOpen, setIsLoginModalOpen,
        preselectedChallenger, setPreselectedChallenger,
        preselectedChallenged, setPreselectedChallenged,
        selectedChallengeToResolve, setSelectedChallengeToResolve,
        selectedPlayerToEdit, setSelectedPlayerToEdit,
        toastMessage, showToast, clearToast,
        handleExportData, handleImportData, handleSaveChallenge,
        handleCompleteMatch, handleAddPlayer, handleSavePlayer,
        handleDeletePlayer, handleDeleteChallenge, handleResetLeague
      }}
    >
      {children}
    </LeagueContext.Provider>
  );
};

export const useLeague = () => {
  const context = useContext(LeagueContext);
  if (context === undefined) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
};
