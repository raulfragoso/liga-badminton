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
import { useAuth } from './contexts/AuthContext';
import { Shuttlecock } from './components/ui/Shuttlecock';
import { Button } from './components/ui/Button';
import { Lock } from 'lucide-react';

export const App: React.FC = () => {
  const { players, challenges, settings } = useLeague();
  const { toastMessage, setIsLoginModalOpen } = useUI();
  const { currentUser } = useAuth();
  
  const leagueLeader = getLeagueLeader(players);
  const totalMatches = challenges.filter(c => c.status === 'completed').length;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-orange-500/30 flex flex-col relative overflow-hidden">
        <PWAInstallPrompt />
        {toastMessage && <Toast message={toastMessage} />}
        
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/10 to-transparent blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/5 to-transparent blur-3xl opacity-50 pointer-events-none" />

        <header className="p-6 relative z-10 flex justify-between items-center max-w-7xl mx-auto w-full border-b border-slate-800/40">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-orange-500/60 shadow-lg shadow-orange-500/20 overflow-hidden p-0.5 shrink-0">
                <img src="/logo-maylson.png" alt="Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">LIGA DE BADMINTON</span>
                <Shuttlecock animate="float" className="w-5 h-5 text-orange-400 hidden sm:block" />
              </h1>
           </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 text-center max-w-2xl mx-auto mt-10 md:mt-0">
          <div className="p-4 bg-orange-500/10 rounded-full border border-orange-500/20 mb-8 shadow-inner shadow-orange-500/10">
            <Lock className="w-12 h-12 text-orange-400" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Área Restrita</h2>
          <p className="text-slate-400 text-base md:text-lg mb-10 leading-relaxed max-w-lg">
            O acesso à pirâmide, histórico de jogos e perfis é exclusivo para atletas registrados. Faça login para continuar.
          </p>
          <Button 
            size="lg" 
            onClick={() => setIsLoginModalOpen(true)} 
            className="text-base md:text-lg px-8 py-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-900/20 rounded-2xl w-full sm:w-auto"
          >
            Acessar o Sistema
          </Button>
        </main>
        
        <LoginModal />
      </div>
    );
  }

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
