import { Layers, Trophy, Swords, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLeague } from '../contexts/LeagueContext';

export function BottomNav() {
  const {
    currentUser,
    challenges
  } = useLeague();

  if (!currentUser) return null;

  const pendingChallenges = challenges.filter(c => c.status === 'pending').length;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        <NavLink
          to="/levels"
          className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all ${
            isActive
              ? 'text-orange-500'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {({ isActive }) => (
            <>
              <Layers className={`w-5 h-5 ${isActive ? 'fill-orange-500/20' : ''}`} />
              <span className="text-[10px] font-semibold">Níveis</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/"
          className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all ${
            isActive
              ? 'text-orange-500'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {({ isActive }) => (
            <>
              <Trophy className={`w-5 h-5 ${isActive ? 'fill-orange-500/20' : ''}`} />
              <span className="text-[10px] font-semibold">Pirâmide</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) => `relative flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all ${
            isActive
              ? 'text-orange-500'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Swords className={`w-5 h-5 ${isActive ? 'fill-orange-500/20' : ''}`} />
                {pendingChallenges > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-slate-950">
                    {pendingChallenges > 9 ? '9+' : pendingChallenges}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold">Desafios</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/players"
          className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all ${
            isActive
              ? 'text-orange-500'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {({ isActive }) => (
            <>
              <Users className={`w-5 h-5 ${isActive ? 'fill-orange-500/20' : ''}`} />
              <span className="text-[10px] font-semibold">Atletas</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
