import React, { useState, useEffect } from 'react';
import { Challenge, Player, GameScore, ChallengeStatus } from '../types/league';
import { processMatchOutcome } from '../utils/leagueRules';
import confetti from 'canvas-confetti';
import { Trophy, X, Check } from 'lucide-react';

interface MatchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge | null;
  players: Player[];
  onCompleteMatch: (
    completedChallenge: Challenge,
    updatedPlayers: Player[],
    summaryMessage: string
  ) => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  isOpen,
  onClose,
  challenge,
  players,
  onCompleteMatch,
}) => {
  const [matchType, setMatchType] = useState<'normal' | 'wo_challenged' | 'wo_challenger' | 'refuse'>('normal');
  const [game1Challenger, setGame1Challenger] = useState<number>(21);
  const [game1Challenged, setGame1Challenged] = useState<number>(18);
  
  const [game2Challenger, setGame2Challenger] = useState<number>(21);
  const [game2Challenged, setGame2Challenged] = useState<number>(15);

  const [hasGame3, setHasGame3] = useState<boolean>(false);
  const [game3Challenger, setGame3Challenger] = useState<number>(21);
  const [game3Challenged, setGame3Challenged] = useState<number>(19);

  useEffect(() => {
    if (challenge) {
      if (challenge.status === 'wo_challenged') {
        setMatchType('wo_challenged');
      } else if (challenge.status === 'wo_challenger') {
        setMatchType('wo_challenger');
      } else if (challenge.status === 'refused_wo' || challenge.status === 'refused_valid') {
        setMatchType('refuse');
      } else {
        setMatchType('normal');
      }

      if (challenge.games && challenge.games.length >= 2) {
        setGame1Challenger(challenge.games[0].challengerScore);
        setGame1Challenged(challenge.games[0].challengedScore);
        setGame2Challenger(challenge.games[1].challengerScore);
        setGame2Challenged(challenge.games[1].challengedScore);

        if (challenge.games.length >= 3) {
          setHasGame3(true);
          setGame3Challenger(challenge.games[2].challengerScore);
          setGame3Challenged(challenge.games[2].challengedScore);
        } else {
          setHasGame3(false);
        }
      } else {
        setGame1Challenger(21);
        setGame1Challenged(18);
        setGame2Challenger(21);
        setGame2Challenged(15);
        setHasGame3(false);
      }
    }
  }, [challenge]);

  if (!isOpen || !challenge) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalGames: GameScore[] = [];
    let overrideStatus: ChallengeStatus = 'completed';

    if (matchType === 'normal') {
      finalGames.push({ challengerScore: Number(game1Challenger), challengedScore: Number(game1Challenged) });
      finalGames.push({ challengerScore: Number(game2Challenger), challengedScore: Number(game2Challenged) });
      if (hasGame3) {
        finalGames.push({ challengerScore: Number(game3Challenger), challengedScore: Number(game3Challenged) });
      }
      overrideStatus = 'completed';
    } else if (matchType === 'wo_challenged') {
      overrideStatus = 'wo_challenged';
    } else if (matchType === 'wo_challenger') {
      overrideStatus = 'wo_challenger';
    } else if (matchType === 'refuse') {
      overrideStatus = 'refused_wo';
    }

    const { updatedPlayers, summaryMessage } = processMatchOutcome(
      challenge,
      players,
      finalGames,
      overrideStatus
    );

    let winnerId: string | undefined;
    if (overrideStatus === 'wo_challenged' || overrideStatus === 'refused_wo') {
      winnerId = challenge.challengerId;
    } else if (overrideStatus === 'wo_challenger') {
      winnerId = challenge.challengedId;
    } else {
      let challengerGames = 0;
      let challengedGames = 0;
      finalGames.forEach(g => {
        if (g.challengerScore > g.challengedScore) challengerGames++;
        else if (g.challengedScore > g.challengerScore) challengedGames++;
      });
      winnerId = challengerGames > challengedGames ? challenge.challengerId : challenge.challengedId;
    }

    const completedChallenge: Challenge = {
      ...challenge,
      status: overrideStatus,
      completedDate: new Date().toISOString().split('T')[0],
      games: finalGames,
      winnerId,
      resultSummary: summaryMessage
    };

    // Disparar confetes se houve vitória / promoção do desafiante!
    if (winnerId === challenge.challengerId) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    onCompleteMatch(completedChallenge, updatedPlayers, summaryMessage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-slate-700 bg-slate-900/90 shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/30 text-orange-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {challenge.status === 'completed' || challenge.status.includes('wo') || challenge.status.includes('refused')
                  ? 'Editar Resultado do Jogo'
                  : 'Registrar Resultado do Jogo'}
              </h3>
              <p className="text-xs text-slate-400">
                {challenge.challengerName} vs {challenge.challengedName}
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Card dos Atletas */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-orange-400 font-semibold mb-1">
                Desafiante (Rank #{challenge.challengerRank})
              </span>
              <span className="text-base font-bold text-slate-100">{challenge.challengerName}</span>
              <span className="text-xs text-slate-400">Nível {challenge.challengerLevel}</span>
            </div>

            <div className="flex flex-col items-center border-l border-slate-800 pl-4">
              <span className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold mb-1">
                Desafiado (Rank #{challenge.challengedRank})
              </span>
              <span className="text-base font-bold text-slate-100">{challenge.challengedName}</span>
              <span className="text-xs text-slate-400">Nível {challenge.challengedLevel}</span>
            </div>
          </div>

          {/* Seleção do Tipo de Conclusão */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Status da Partida
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setMatchType('normal')}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                  matchType === 'normal'
                    ? 'bg-orange-600/20 border-orange-500 text-orange-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                🎮 Jogo Realizado (Games)
              </button>
              <button
                type="button"
                onClick={() => setMatchType('wo_challenged')}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                  matchType === 'wo_challenged'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                ⚠️ WO Desafiado (Faltou)
              </button>
              <button
                type="button"
                onClick={() => setMatchType('wo_challenger')}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                  matchType === 'wo_challenger'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                🚫 WO Desafiante (Faltou + Suspensão)
              </button>
              <button
                type="button"
                onClick={() => setMatchType('refuse')}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                  matchType === 'refuse'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                ❌ Recusa de Desafio (WO)
              </button>
            </div>
          </div>

          {/* Entradas de Placar por Game (se Conclusão Normal) */}
          {matchType === 'normal' && (
            <div className="space-y-4 pt-2">
              <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Placar dos Games (Regra da FEBASP)
              </span>

              {/* Game 1 */}
              <div className="flex items-center justify-between gap-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300 w-16">Game 1:</span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={game1Challenger}
                    onChange={(e) => setGame1Challenger(Number(e.target.value))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-orange-400"
                  />
                  <span className="text-slate-500 font-bold">X</span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={game1Challenged}
                    onChange={(e) => setGame1Challenged(Number(e.target.value))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-blue-400"
                  />
                </div>
              </div>

              {/* Game 2 */}
              <div className="flex items-center justify-between gap-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300 w-16">Game 2:</span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={game2Challenger}
                    onChange={(e) => setGame2Challenger(Number(e.target.value))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-orange-400"
                  />
                  <span className="text-slate-500 font-bold">X</span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={game2Challenged}
                    onChange={(e) => setGame2Challenged(Number(e.target.value))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-blue-400"
                  />
                </div>
              </div>

              {/* Game 3 Opcional */}
              {hasGame3 ? (
                <div className="flex items-center justify-between gap-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-300 w-16">Game 3 (Desempate):</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={game3Challenger}
                      onChange={(e) => setGame3Challenger(Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-orange-400"
                    />
                    <span className="text-slate-500 font-bold">X</span>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={game3Challenged}
                      onChange={(e) => setGame3Challenged(Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-blue-400"
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setHasGame3(true)}
                  className="text-xs text-orange-400 hover:text-orange-300 font-medium underline flex items-center gap-1"
                >
                  + Adicionar Game 3 de Desempate
                </button>
              )}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Finalizar Jogo e Atualizar Pirâmide
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
