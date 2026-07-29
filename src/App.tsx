import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PyramidView } from './components/PyramidView';
import { LevelListView } from './components/LevelListView';
import { NewChallengeModal } from './components/NewChallengeModal';
import { MatchResultModal } from './components/MatchResultModal';
import { MatchHistory } from './components/MatchHistory';
import { PlayerManagementModal } from './components/PlayerManagementModal';
import { RulesModal } from './components/RulesModal';
import { ResetLeagueModal } from './components/ResetLeagueModal';
import { EditPlayerModal } from './components/EditPlayerModal';
import { LoginModal } from './components/LoginModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Toast } from './components/Toast';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PlayersView } from './components/PlayersView';
import { getLeagueLeader } from './utils/leagueRules';
import { Calendar, Award } from 'lucide-react';
import { useLeague } from './contexts/LeagueContext';
import { useUI } from './contexts/UIContext';

export const App: React.FC = () => {
  const { players, challenges, settings } = useLeague();
  const { toastMessage } = useUI();
  
  const leagueLeader = getLeagueLeader(players);
  const totalMatches = challenges.filter(c => c.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-orange-500/30">
      <PWAInstallPrompt />

      {toastMessage && (
        <Toast message={toastMessage} />
      )}

      <Header />

      {/* O padding inferior extra garante que a BottomNav não esconda conteúdo no mobile */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Coluna Esquerda: Estatísticas Principais (Desktop) / Fim (Mobile) */}
        <div className="w-full lg:w-72 shrink-0 space-y-4 order-2 lg:order-1">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl shadow-black/20">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{settings.name}</h3>
            </div>
            
            <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">Semana Atual</div>
                  <div className="text-3xl font-black text-white">{settings.currentWeek}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Período ativo para desafios
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Resumo da Temporada</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-800/50">
                      <div className="text-lg font-bold text-white">{players.length}</div>
                      <div className="text-[10px] text-slate-400">Atletas Ativos</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-800/50">
                      <div className="text-lg font-bold text-white">{totalMatches}</div>
                      <div className="text-[10px] text-slate-400">Jogos Realizados</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {leagueLeader && (
              <div className="glass-panel rounded-2xl p-5 border border-orange-500/20 shadow-xl shadow-orange-900/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-transparent blur-2xl rounded-bl-full" />
                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <Award className="w-4 h-4 text-orange-400" />
                  <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Líder Atual</h3>
                </div>
                <div className="relative z-10">
                  <div className="text-lg font-black text-white leading-tight">{leagueLeader.name}</div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">Rank #1 • Nível {leagueLeader.level}</div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-bold">
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {leagueLeader.wins} Vitórias
                    </span>
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {leagueLeader.wins + leagueLeader.losses} Jogos
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 order-1 lg:order-2">
            <div className="animate-fadeIn">
              <Routes>
                <Route path="/" element={<PyramidView />} />
                <Route path="/levels" element={<LevelListView />} />
                <Route path="/history" element={<MatchHistory />} />
                <Route path="/players" element={<PlayersView />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
          </div>
        </div>
      </main>

      <BottomNav />

      <LoginModal />
      <NewChallengeModal />
      <MatchResultModal />
      <PlayerManagementModal />
      <EditPlayerModal />
      <RulesModal />
      <ResetLeagueModal />
    </div>
  );
};

export default App;
