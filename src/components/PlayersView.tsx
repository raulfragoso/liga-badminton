import { Plus, Pencil } from 'lucide-react';
import { formatPhoneDisplay } from '../utils/auth';
import { Button } from './ui/Button';
import { useLeague } from '../contexts/LeagueContext';

export const PlayersView: React.FC = () => {
  const {
    players,
    currentUser,
    isAdmin,
    setIsPlayerModalOpen,
    setSelectedPlayerToEdit,
    setIsEditPlayerModalOpen
  } = useLeague();

  return (
    <div className="w-full max-w-5xl glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Quadro de Atletas Ranqueados</h3>
          <p className="text-xs text-slate-400">Lista ordenada por rank e nível atual na liga</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setIsPlayerModalOpen(true)}
            size="sm"
          >
            <Plus className="w-4 h-4" /> Cadastrar Atleta
          </Button>
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
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedPlayerToEdit(p);
                          setIsEditPlayerModalOpen(true);
                        }}
                        className="bg-slate-950 hover:text-orange-400"
                        title={isAdmin ? "Editar Atleta" : "Editar Meu Perfil"}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>{currentUser?.id === p.id ? "Meu Perfil" : "Editar"}</span>
                      </Button>
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
  );
}
