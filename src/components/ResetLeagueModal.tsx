import React, { useState } from 'react';
import { LeagueSettings } from '../types/league';
import { RotateCcw, X, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ResetLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: LeagueSettings;
  onResetLeague: (
    newStartDate: string,
    newEndDate: string,
    newSeasonName?: string
  ) => void;
}

export const ResetLeagueModal: React.FC<ResetLeagueModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onResetLeague,
}) => {
  // Configurar datas padrões: hoje e +3 meses
  const todayStr = new Date().toISOString().split('T')[0];
  
  const defaultEnd = new Date();
  defaultEnd.setMonth(defaultEnd.getMonth() + 3);
  const defaultEndStr = defaultEnd.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(currentSettings.seasonStartDate || todayStr);
  const [endDate, setEndDate] = useState<string>(currentSettings.seasonEndDate || defaultEndStr);
  const [seasonName, setSeasonName] = useState<string>(currentSettings.name || 'Liga de Badminton Maylson Campos');
  const [confirmCheckbox, setConfirmCheckbox] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    if (!confirmCheckbox) return;

    onResetLeague(startDate, endDate, seasonName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/30 text-rose-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Resetar Liga / Nova Temporada</h3>
              <p className="text-xs text-slate-400">Zerar todos os jogos e definir novas datas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Caixa de Alerta */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Atenção: Ação de Reinício de Temporada
            </div>
            <p className="leading-relaxed">
              Ao resetar a liga para uma nova temporada:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Todos os <strong>jogos e desafios anteriores serão zerados</strong>.</li>
              <li>O <strong>nível de todos os atletas será reiniciado para o Nível 1</strong>.</li>
              <li>O histórico de vitórias e derrotas dos atletas será reiniciado para 0.</li>
              <li>Todas as <strong>suspensões vigentes serão removidas</strong>.</li>
              <li>A contagem da temporada será reiniciada na <strong>Semana 1</strong>.</li>
            </ul>
          </div>

          {/* Nome da Liga / Temporada */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nome da Liga / Temporada
            </label>
            <input
              type="text"
              required
              value={seasonName}
              onChange={(e) => setSeasonName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Data de Início e Término */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                Data de Início
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                Data de Término (3 Meses)
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Checkbox de Confirmação */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={confirmCheckbox}
                onChange={(e) => setConfirmCheckbox(e.target.checked)}
                className="mt-0.5 rounded bg-slate-950 border-slate-800 text-orange-600 focus:ring-orange-500"
              />
              <span>
                Estou ciente de que todos os jogos serão zerados e uma nova temporada será iniciada com as datas informadas.
              </span>
            </label>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!confirmCheckbox}
              className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all flex items-center gap-2 ${
                confirmCheckbox
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Zerar Jogos e Iniciar Temporada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
