import { Player, Challenge, ChallengeStatus, MatchOutcome, PyramidTier } from '../types/league';

/**
 * Retorna o nível correspondente para uma dada posição na pirâmide.
 * Padrão: Todos iniciam no Nível 1.
 */
export function getPyramidLevelForRank(_rank: number): number {
  return 1;
}

/**
 * Constrói os níveis (tiers) da pirâmide organizando os atletas por seu nível atribuído.
 * Todos iniciam no Nível 1 e vão subindo conforme vencem desafios.
 * A visualização exibe do Nível mais alto alcançado no topo até o Nível 1 na base.
 */
export function buildPyramidTiers(players: Player[]): PyramidTier[] {
  const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);
  const tiersMap = new Map<number, Player[]>();

  let maxLevel = 1;
  sortedPlayers.forEach(player => {
    // Garante que o nível nunca seja menor que 1 (Nível 1 é o nível base de entrada)
    const level = Math.max(1, player.level || 1);
    player.level = level;
    if (level > maxLevel) maxLevel = level;

    if (!tiersMap.has(level)) {
      tiersMap.set(level, []);
    }
    tiersMap.get(level)!.push(player);
  });

  const tiers: PyramidTier[] = [];
  // Renderizar do Nível mais alto (Topo) até o Nível 1 (Base de Entrada)
  for (let lvl = maxLevel; lvl >= 1; lvl--) {
    tiers.push({
      level: lvl,
      capacity: lvl,
      players: tiersMap.get(lvl) || []
    });
  }

  return tiers;
}

/**
 * Valida se um novo desafio pode ser realizado de acordo com o regulamento.
 */
export function validateNewChallenge(
  challenger: Player,
  challenged: Player,
  currentWeek: number,
  challenges: Challenge[]
): { valid: boolean; reason?: string } {
  // 1. Não pode desafiar a si mesmo
  if (challenger.id === challenged.id) {
    return { valid: false, reason: 'Um atleta não pode desafiar a si mesmo.' };
  }

  // 2. Verificar se o desafiante já possui um desafio nesta semana
  const hasActiveChallengeThisWeek = challenges.some(
    c => c.weekNumber === currentWeek && c.challengerId === challenger.id
  );
  if (hasActiveChallengeThisWeek) {
    return {
      valid: false,
      reason: `${challenger.name} já possui um desafio registrado na Semana ${currentWeek}.`
    };
  }

  // 3. Verificar se o desafiante está em cooldown/suspensão por punição
  if (challenger.status === 'cooldown' && challenger.cooldownUntil) {
    const cooldownDate = new Date(challenger.cooldownUntil);
    if (new Date() < cooldownDate) {
      return {
        valid: false,
        reason: `${challenger.name} está suspenso de realizar novos desafios por 2 semanas (${challenger.cooldownReason || 'Punição por regulamento'}).`
      };
    }
  }

  // 4. Regra de Prioridade: Se o desafiado tem nível mais alto que o desafiante
  if (challenged.level > challenger.level) {
    const isChallengedChallengedThisWeek = challenges.some(
      c => c.weekNumber === currentWeek && c.challengerId === challenged.id
    );
    if (isChallengedChallengedThisWeek) {
      return {
        valid: false,
        reason: `${challenged.name} (Nível ${challenged.level}) tem prioridade por estar em nível mais alto e já realizou seu desafio nesta semana.`
      };
    }
  }

  return { valid: true };
}

/**
 * Aplica punição de 2 semanas de suspensão (cooldown).
 */
export function applyTwoWeekCooldown(player: Player, reason: string): Player {
  const cooldownUntil = new Date();
  cooldownUntil.setDate(cooldownUntil.getDate() + 14);

  return {
    ...player,
    status: 'cooldown',
    cooldownUntil: cooldownUntil.toISOString(),
    cooldownReason: reason
  };
}

/**
 * Processa a conclusão de um jogo ou WO e atualiza os níveis dos atletas na pirâmide.
 */
export function processMatchOutcome(
  challenge: Challenge,
  currentPlayers: Player[],
  games: { challengerScore: number; challengedScore: number }[],
  overrideStatus?: ChallengeStatus
): MatchOutcome {
  const playersCopy = currentPlayers.map(p => ({ ...p }));
  const challenger = playersCopy.find(p => p.id === challenge.challengerId);
  const challenged = playersCopy.find(p => p.id === challenge.challengedId);

  if (!challenger || !challenged) {
    throw new Error('Atletas não encontrados no sistema.');
  }

  const finalStatus = overrideStatus || challenge.status;

  let winnerId: string | undefined;
  let summaryMessage = '';

  // Determinar vencedor por placar ou WO
  if (finalStatus === 'wo_challenged' || finalStatus === 'refused_wo') {
    winnerId = challenger.id;
  } else if (finalStatus === 'wo_challenger') {
    winnerId = challenged.id;
  } else if (games && games.length > 0) {
    let challengerGames = 0;
    let challengedGames = 0;
    games.forEach(g => {
      if (g.challengerScore > g.challengedScore) challengerGames++;
      else if (g.challengedScore > g.challengerScore) challengedGames++;
    });

    if (challengerGames > challengedGames) {
      winnerId = challenger.id;
    } else {
      winnerId = challenged.id;
    }
  }

  const isChallengerWinner = winnerId === challenger.id;
  const winner = winnerId === challenger.id ? challenger : challenged;
  const loser = winnerId === challenger.id ? challenged : challenger;

  const isSameLevel = winner.level === loser.level;
  const isWinnerLowerLevel = winner.level < loser.level;

  if (finalStatus === 'wo_challenger') {
    const updatedChallenger = applyTwoWeekCooldown(challenger, 'Falta sem aviso prévio (WO) como desafiante.');
    Object.assign(challenger, updatedChallenger);
    summaryMessage = `WO do Desafiante ${challenger.name}. ${challenged.name} foi declarado vencedor. ${challenger.name} recebeu punição de 2 semanas de suspensão para novos desafios.`;
  } else if (isSameLevel) {
    winner.level += 1;
    summaryMessage = `Vitória de ${winner.name} no mesmo nível! ${winner.name} subiu para o Nível ${winner.level}.`;
  } else if (isWinnerLowerLevel) {
    const oldWinnerLevel = winner.level;
    const oldLoserLevel = loser.level;

    winner.level = oldLoserLevel;
    loser.level = Math.max(1, oldWinnerLevel);

    summaryMessage = `Vitória de ${winner.name}! Como o adversário (${loser.name}) era de nível superior (Nível ${oldLoserLevel}), ${winner.name} subiu para o Nível ${winner.level} e ${loser.name} passou para o Nível ${loser.level}.`;
  } else {
    // Vencedor já era de nível superior ao perdedor
    if (!isChallengerWinner && challenger.level > challenged.level) {
      // Se o desafiante (nível superior) perdeu para o desafiado (nível inferior), o desafiante sofre suspensão
      const updatedChallenger = applyTwoWeekCooldown(challenger, `Derrota para desafiado de nível inferior (${challenged.name}).`);
      Object.assign(challenger, updatedChallenger);
    }
    summaryMessage = `Vitória de ${winner.name} contra atleta de nível inferior. Níveis mantidos.`;
  }

  return {
    updatedPlayers: playersCopy.sort((a, b) => b.level - a.level || a.rank - b.rank),
    summaryMessage
  };
}

/**
 * Recalcula cronologicamente os níveis e as estatísticas reais (vitórias e derrotas)
 * de todos os atletas com base no histórico completo de jogos da liga.
 */
export function recalculatePlayerStats(players: Player[], challenges: Challenge[]): Player[] {
  // Mapa de estado dinâmico dos atletas
  const stateMap = new Map<string, { level: number; wins: number; losses: number; pointsScored: number; pointsConceded: number }>();

  players.forEach(p => {
    stateMap.set(p.id, {
      level: 1, // Todos iniciam no Nível 1
      wins: 0,
      losses: 0,
      pointsScored: 0,
      pointsConceded: 0
    });
  });

  // Filtrar partidas concluídas e ordenar por semana/data cronológica
  const completedChallenges = challenges
    .filter(ch => ch.status === 'completed' || ch.status === 'wo_challenger' || ch.status === 'wo_challenged' || ch.status === 'refused_wo')
    .sort((a, b) => (a.weekNumber || 0) - (b.weekNumber || 0) || new Date(a.scheduledDate || 0).getTime() - new Date(b.scheduledDate || 0).getTime());

  completedChallenges.forEach(ch => {
    const challengerState = stateMap.get(ch.challengerId);
    const challengedState = stateMap.get(ch.challengedId);

    if (!challengerState || !challengedState) return;

    // Acumular pontos ganhos e sofridos nos sets da partida
    if (ch.games && ch.games.length > 0) {
      ch.games.forEach(g => {
        const cScore = Number(g.challengerScore) || 0;
        const dScore = Number(g.challengedScore) || 0;

        challengerState.pointsScored += cScore;
        challengerState.pointsConceded += dScore;

        challengedState.pointsScored += dScore;
        challengedState.pointsConceded += cScore;
      });
    }

    let winnerId = ch.winnerId;

    if (!winnerId) {
      if (ch.status === 'wo_challenged' || ch.status === 'refused_wo') {
        winnerId = ch.challengerId;
      } else if (ch.status === 'wo_challenger') {
        winnerId = ch.challengedId;
      } else if (ch.games && ch.games.length > 0) {
        let challengerGames = 0;
        let challengedGames = 0;
        ch.games.forEach(g => {
          if (g.challengerScore > g.challengedScore) challengerGames++;
          else if (g.challengedScore > g.challengerScore) challengedGames++;
        });
        winnerId = challengerGames > challengedGames ? ch.challengerId : ch.challengedId;
      }
    }

    if (winnerId) {
      const winnerState = winnerId === ch.challengerId ? challengerState : challengedState;
      const loserState = winnerId === ch.challengerId ? challengedState : challengerState;

      winnerState.wins += 1;
      loserState.losses += 1;

      const isSameLevel = winnerState.level === loserState.level;
      const isWinnerLowerLevel = winnerState.level < loserState.level;

      if (isWinnerLowerLevel) {
        const oldWinnerLevel = winnerState.level;
        const oldLoserLevel = loserState.level;

        winnerState.level = oldLoserLevel;
        loserState.level = Math.max(1, oldWinnerLevel);
      } else if (isSameLevel) {
        winnerState.level += 1;
      }
    }
  });

  return players.map(p => {
    const s = stateMap.get(p.id) || { level: 1, wins: 0, losses: 0, pointsScored: 0, pointsConceded: 0 };
    const pointDiff = s.pointsScored - s.pointsConceded;

    return {
      ...p,
      level: Math.max(1, s.level),
      wins: s.wins,
      losses: s.losses,
      pointsScored: s.pointsScored,
      pointsConceded: s.pointsConceded,
      pointDiff
    };
  });
}

/**
 * Ordena e identifica o Líder Atual da Liga.
 * Regra Principal: Número de jogos ganhos (Vitórias).
 * Critério de Desempate: Saldo de pontos ganhos acumulados (pontosScored - pontosConceded).
 */
export function getLeagueLeader(players: Player[], challenges: Challenge[] = []): Player | null {
  const computedPlayers = (challenges && challenges.length > 0)
    ? recalculatePlayerStats(players, challenges)
    : players;

  const activeList = computedPlayers.filter(p => p.status === 'active');
  if (activeList.length === 0) return null;

  const sorted = [...activeList].sort((a, b) => {
    // 1. Número de jogos ganhos (Vitórias)
    const winsA = a.wins || 0;
    const winsB = b.wins || 0;
    if (winsB !== winsA) return winsB - winsA;

    // 2. Desempate: Saldo de pontos ganhos acumulados
    const diffA = (a.pointDiff !== undefined) ? a.pointDiff : ((a.pointsScored || 0) - (a.pointsConceded || 0));
    const diffB = (b.pointDiff !== undefined) ? b.pointDiff : ((b.pointsScored || 0) - (b.pointsConceded || 0));
    if (diffB !== diffA) return diffB - diffA;

    // 3. Desempate 2: Pontos pró acumulados
    const scoredA = a.pointsScored || 0;
    const scoredB = b.pointsScored || 0;
    if (scoredB !== scoredA) return scoredB - scoredA;

    // 4. Desempate 3: Posição/Rank histórico
    return a.rank - b.rank;
  });

  return sorted[0];
}

/**
 * Formata um contador de dias para a conclusão do período de 3 meses da liga.
 */
export function getQuarterEndCountdown(endDateStr: string): {
  daysLeft: number;
  formattedEndDate: string;
} {
  const endDate = new Date(endDateStr);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    daysLeft,
    formattedEndDate: endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  };
}
