export type UserRole = 'admin' | 'athlete';

export interface Player {
  id: string;
  name: string;
  rank: number; // Posição absoluta 1..N (1 é o #1 do ranking/topo da pirâmide)
  level: number; // Nível da pirâmide (1, 2, 3, 4...)
  avatar?: string;
  phone?: string;
  password?: string; // Senha do login
  role: UserRole; // 'admin' ou 'athlete'
  wins: number;
  losses: number;
  status: 'active' | 'cooldown' | 'injured';
  cooldownUntil?: string; // Data ISO até quando não pode desafiar
  cooldownReason?: string;
  lastChallengeWeek?: number; // Número da semana em que realizou o último desafio como desafiante
  createdAt: string;
}

export interface GameScore {
  challengerScore: number;
  challengedScore: number;
}

export type ChallengeStatus = 
  | 'pending'         // Desafio agendado
  | 'completed'       // Jogo realizado normalmente
  | 'refused_valid'   // Recusa justificada (sem penalidade)
  | 'refused_wo'      // Segunda recusa ou sem justificativa (Equivale a WO do desafiado)
  | 'wo_challenged'   // Desafiado faltou sem avisar 1h antes (WO desafiado)
  | 'wo_challenger';  // Desafiante faltou sem avisar (WO desafiante - punição 2 sem)

export interface Challenge {
  id: string;
  challengerId: string;
  challengedId: string;
  challengerName: string;
  challengedName: string;
  challengerRank: number;
  challengedRank: number;
  challengerLevel: number;
  challengedLevel: number;
  status: ChallengeStatus;
  scheduledDate: string; // YYYY-MM-DD
  completedDate?: string;
  games?: GameScore[];
  winnerId?: string;
  weekNumber: number;
  notes?: string;
  resultSummary?: string; // Resumo do efeito na pirâmide
}

export interface PyramidTier {
  level: number;
  capacity: number; // Nível N comporta N atletas
  players: Player[];
}

export interface LeagueSettings {
  name: string;
  seasonStartDate: string;
  seasonEndDate: string;
  currentWeek: number;
  maxRefusalsWithoutPenalty: number;
}

export interface MatchOutcome {
  updatedPlayers: Player[];
  summaryMessage: string;
}
