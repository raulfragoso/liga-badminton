import React, { useState } from 'react';
import { RotateCcw, X, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useLeague } from '../contexts/LeagueContext';

export const ResetLeagueModal: React.FC = () => {
  const { isResetLeagueModalOpen: isOpen, setIsResetLeagueModalOpen, settings: currentSettings, handleResetLeague } = useLeague();
  
  const onClose = () => setIsResetLeagueModalOpen(false);

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

    handleResetLeague(startDate, endDate, seasonName || currentSettings.name);
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
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
          <Input
            label="Nome da Liga / Temporada"
            type="text"
            required
            value={seasonName}
            onChange={(e) => setSeasonName(e.target.value)}
          />

          {/* Data de Início e Término */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data de Início"
              leftIcon={<Calendar className="w-4 h-4" />}
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="Data de Término (3 Meses)"
              leftIcon={<Calendar className="w-4 h-4" />}
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
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
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={!confirmCheckbox}
            >
              <CheckCircle2 className="w-4 h-4" />
              Zerar Liga e Iniciar Nova Temporada
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
