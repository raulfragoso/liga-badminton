import { 
  LogOut, Plus, LogIn, BookOpen, RotateCcw, 
  Download, Upload, Layers, Trophy, Swords, Users 
} from 'lucide-react';
import { Button } from './ui/Button';
import { NavLink } from 'react-router-dom';

import { useLeague } from '../contexts/LeagueContext';

export function Header() {
  const {
    currentUser,
    isAdmin,
    challenges,
    players,
    handleLogout,
    setPreselectedChallenger,
    setPreselectedChallenged,
    setIsNewChallengeModalOpen,
    setIsLoginModalOpen,
    setIsRulesModalOpen,
    setIsResetLeagueModalOpen,
    handleExportData,
    handleImportData
  } = useLeague();
  return (
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
                <Button
                  onClick={() => {
                    setPreselectedChallenger(currentUser || null);
                    setPreselectedChallenged(null);
                    setIsNewChallengeModalOpen(true);
                  }}
                  size="md"
                  className="whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Novo Desafio</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsLoginModalOpen(true)}
                size="md"
              >
                <LogIn className="w-4 h-4" />
                Entrar
              </Button>
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

        {/* LINHA 2: NAVEGAÇÃO SEGMENTADA POR ABAS (Apenas Desktop) */}
        {currentUser && (
          <div className="hidden sm:flex items-center justify-start overflow-x-auto pt-1 border-t border-slate-900/90 no-scrollbar">
            <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80">
              <NavLink
                to="/levels"
                className={({ isActive }) => `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Lista por Níveis
              </NavLink>

              <NavLink
                to="/"
                className={({ isActive }) => `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                Pirâmide
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) => `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                Desafios ({challenges.filter(c => c.status === 'pending').length})
              </NavLink>

              <NavLink
                to="/players"
                className={({ isActive }) => `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Atletas ({players.length})
              </NavLink>
            </nav>
          </div>
        )}

      </div>
    </header>
  );
}
