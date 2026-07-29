import { Layers, Trophy, Swords, Users } from 'lucide-react';
import { useLeague } from '../contexts/LeagueContext';

export function BottomNav() {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    challenges
  } = useLeague();

  if (!currentUser) return null;

  const pendingChallenges = challenges.filter(c => c.status === 'pending').length;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        <button
          onClick={() => setActiveTab('levels')}
          className={`flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all ${
            activeTab === 'levels'
              ? 'text-orange-500'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Layers className={`w-5 h-5 ${activeTab === 'levels' ? 'fill-orange-500/20' : ''}`} />
          <span className="text-[10px] font-semibold">Níveis</span>
        </button>

        <button
          onClick={() => setActiveTab('pyramid')}
          className={`flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all ${
            activeTab === 'pyramid'
              ? 'text-orange-500'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Trophy className={`w-5 h-5 ${activeTab === 'pyramid' ? 'fill-orange-500/20' : ''}`} />
          <span className="text-[10px] font-semibold">Pirâmide</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`relative flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all ${
            activeTab === 'history'
              ? 'text-orange-500'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <Swords className={`w-5 h-5 ${activeTab === 'history' ? 'fill-orange-500/20' : ''}`} />
            {pendingChallenges > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-slate-950">
                {pendingChallenges > 9 ? '9+' : pendingChallenges}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Desafios</span>
        </button>

        <button
          onClick={() => setActiveTab('players')}
          className={`flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all ${
            activeTab === 'players'
              ? 'text-orange-500'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'players' ? 'fill-orange-500/20' : ''}`} />
          <span className="text-[10px] font-semibold">Atletas</span>
        </button>
      </div>
    </nav>
  );
}
