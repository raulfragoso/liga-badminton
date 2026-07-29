import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player, Challenge, LeagueSettings } from '../types/league';
import { INITIAL_SETTINGS } from '../data/initialData';
import { recalculatePlayerStats } from '../utils/leagueRules';
import { useUI } from './UIContext';
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

interface LeagueContextProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  challenges: Challenge[];
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  settings: LeagueSettings;
  setSettings: React.Dispatch<React.SetStateAction<LeagueSettings>>;

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
  const { showToast } = useUI();

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
    
    showToast('Resultado Salvo!', summaryMessage);
  };

  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers(prev => {
      const updated = [...prev, newPlayer];
      if (isSupabaseConfigured) saveSinglePlayerToSupabase(newPlayer);
      return updated;
    });
    showToast('Atleta Cadastrado!', `${newPlayer.name} entrou na liga.`);
  };

  const handleSavePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => {
      const nextPlayers = prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
      const recalculated = recalculatePlayerStats(nextPlayers, challenges);
      if (isSupabaseConfigured) {
        saveAllPlayersToSupabase(recalculated);
      }
      return recalculated;
    });
    showToast('Atleta Atualizado!', 'As informações foram salvas com sucesso.');
  };

  const handleDeletePlayer = (playerId: string) => {
    setPlayers(prev => {
      const updated = prev.filter(p => p.id !== playerId);
      if (isSupabaseConfigured) deletePlayerFromSupabase(playerId);
      return updated;
    });
    showToast('Atleta Removido', 'O atleta foi excluído do sistema.');
  };

  const handleDeleteChallenge = (challengeId: string) => {
    setChallenges(prev => {
      const nextChallenges = prev.filter(c => c.id !== challengeId);
      const recalculated = recalculatePlayerStats(players, nextChallenges);
      setPlayers(recalculated);
      if (isSupabaseConfigured) {
        deleteChallengeFromSupabase(challengeId);
        saveAllPlayersToSupabase(recalculated);
      }
      return nextChallenges;
    });
    showToast('Desafio Cancelado', 'O desafio foi apagado do sistema.', 'warning');
  };

  const handleResetLeague = (start: string, end: string, newSeasonName: string = 'Nova Temporada') => {
    const nextSettings: LeagueSettings = {
      ...settings,
      name: newSeasonName,
      seasonStartDate: start,
      seasonEndDate: end,
      currentWeek: 1
    };
    
    setSettings(nextSettings);
    setChallenges([]);
    
    const resetPlayers = players.map(p => ({
      ...p,
      wins: 0,
      losses: 0,
      points: 0,
      lastChallengeWeek: 0,
      history: []
    }));
    
    setPlayers(resetPlayers);

    if (isSupabaseConfigured) {
      saveSettingsToSupabase(nextSettings);
      saveAllPlayersToSupabase(resetPlayers);
      challenges.forEach(c => deleteChallengeFromSupabase(c.id));
    }
    
    showToast('Liga Reiniciada!', 'Todos os jogos e estatísticas foram zerados.');
  };

  return (
    <LeagueContext.Provider
      value={{
        players, setPlayers,
        challenges, setChallenges,
        settings, setSettings,
        handleExportData, handleImportData,
        handleSaveChallenge, handleCompleteMatch,
        handleAddPlayer, handleSavePlayer,
        handleDeletePlayer, handleDeleteChallenge,
        handleResetLeague
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
