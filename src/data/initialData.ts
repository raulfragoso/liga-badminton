import { Player, Challenge, LeagueSettings } from '../types/league';

export const INITIAL_SETTINGS: LeagueSettings = {
  name: "Liga de Badminton - Complexo Esportivo Maylson Campos",
  seasonStartDate: "2026-07-01",
  seasonEndDate: "2026-09-30",
  currentWeek: 4,
  maxRefusalsWithoutPenalty: 1
};

export const INITIAL_PLAYERS: Player[] = [
  // Nível 1 (Top 1) - 1 Atleta (ADMINISTRADOR DA LIGA)
  {
    id: "p1",
    name: "Gabriel Santos",
    rank: 1,
    level: 1,
    phone: "11987654321",
    password: "admin",
    role: "admin",
    wins: 8,
    losses: 1,
    status: "active",
    createdAt: "2026-07-01"
  },

  // Nível 2 (Ranks 2-3) - 2 Atletas
  {
    id: "p2",
    name: "Lucas Oliveira",
    rank: 2,
    level: 1,
    phone: "11976543210",
    password: "123",
    role: "athlete",
    wins: 7,
    losses: 2,
    status: "active",
    createdAt: "2026-07-01"
  },
  {
    id: "p3",
    name: "Matheus Lima",
    rank: 3,
    level: 1,
    phone: "11965432109",
    password: "123",
    role: "athlete",
    wins: 6,
    losses: 3,
    status: "active",
    createdAt: "2026-07-01"
  },

  // Nível 3 (Ranks 4-6) - 3 Atletas
  {
    id: "p4",
    name: "Rafael Costa",
    rank: 4,
    level: 1,
    phone: "11954321098",
    password: "123",
    role: "athlete",
    wins: 5,
    losses: 3,
    status: "active",
    createdAt: "2026-07-01"
  },
  {
    id: "p5",
    name: "Felipe Almeida",
    rank: 5,
    level: 1,
    phone: "11943210987",
    password: "123",
    role: "athlete",
    wins: 4,
    losses: 4,
    status: "active",
    createdAt: "2026-07-01"
  },
  {
    id: "p6",
    name: "Bruno Ferreira",
    rank: 6,
    level: 1,
    phone: "11932109876",
    password: "123",
    role: "athlete",
    wins: 5,
    losses: 2,
    status: "active",
    createdAt: "2026-07-01"
  },

  // Nível 4 (Ranks 7-10) - 4 Atletas
  {
    id: "p7",
    name: "Thiago Silva",
    rank: 7,
    level: 1,
    phone: "11921098765",
    password: "123",
    role: "athlete",
    wins: 3,
    losses: 4,
    status: "cooldown",
    cooldownUntil: "2026-08-05T00:00:00.000Z",
    cooldownReason: "Derrota para adversário de nível superior (Nível 2).",
    createdAt: "2026-07-01"
  },
  {
    id: "p8",
    name: "Rodrigo Souza",
    rank: 8,
    level: 1,
    phone: "11910987654",
    password: "123",
    role: "athlete",
    wins: 3,
    losses: 3,
    status: "active",
    lastChallengeWeek: 4, // já desafiou na semana atual
    createdAt: "2026-07-01"
  },
  {
    id: "p9",
    name: "Camila Rodrigues",
    rank: 9,
    level: 1,
    phone: "11909876543",
    password: "123",
    role: "athlete",
    wins: 4,
    losses: 2,
    status: "active",
    createdAt: "2026-07-01"
  },
  {
    id: "p10",
    name: "Beatriz Carvalho",
    rank: 10,
    level: 1,
    phone: "11998765432",
    password: "123",
    role: "athlete",
    wins: 2,
    losses: 5,
    status: "active",
    createdAt: "2026-07-01"
  },

  // Nível 5 (Ranks 11-15) - 5 Atletas
  {
    id: "p11",
    name: "André Martins",
    rank: 11,
    level: 1,
    phone: "11987651111",
    password: "123",
    role: "athlete",
    wins: 2,
    losses: 3,
    status: "active",
    createdAt: "2026-07-05"
  },
  {
    id: "p12",
    name: "Juliana Mendes",
    rank: 12,
    level: 1,
    phone: "11976542222",
    password: "123",
    role: "athlete",
    wins: 1,
    losses: 4,
    status: "active",
    createdAt: "2026-07-05"
  },
  {
    id: "p13",
    name: "Vinícius Ribeiro",
    rank: 13,
    level: 1,
    phone: "11965433333",
    password: "123",
    role: "athlete",
    wins: 2,
    losses: 2,
    status: "active",
    createdAt: "2026-07-10"
  },
  {
    id: "p14",
    name: "Larissa Fernandes",
    rank: 14,
    level: 1,
    phone: "11954324444",
    password: "123",
    role: "athlete",
    wins: 1,
    losses: 2,
    status: "active",
    createdAt: "2026-07-12"
  },
  {
    id: "p15",
    name: "Marcelo Rocha",
    rank: 15,
    level: 1,
    phone: "11943215555",
    password: "123",
    role: "athlete",
    wins: 0,
    losses: 1,
    status: "active",
    createdAt: "2026-07-20"
  }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  // Desafio Pendente
  {
    id: "c-101",
    challengerId: "p8",
    challengedId: "p4",
    challengerName: "Rodrigo Souza",
    challengedName: "Rafael Costa",
    challengerRank: 8,
    challengedRank: 4,
    challengerLevel: 4,
    challengedLevel: 3,
    status: "pending",
    scheduledDate: "2026-07-30",
    weekNumber: 4,
    notes: "Jogo agendado para Quinta-feira às 19:30 no Quadra 2."
  },

  // Desafios Concluídos Anteriores
  {
    id: "c-100",
    challengerId: "p1",
    challengedId: "p2",
    challengerName: "Gabriel Santos",
    challengedName: "Lucas Oliveira",
    challengerRank: 2,
    challengedRank: 1,
    challengerLevel: 2,
    challengedLevel: 1,
    status: "completed",
    scheduledDate: "2026-07-25",
    completedDate: "2026-07-25",
    weekNumber: 3,
    games: [
      { challengerScore: 21, challengedScore: 19 },
      { challengerScore: 18, challengedScore: 21 },
      { challengerScore: 21, challengedScore: 16 }
    ],
    winnerId: "p1",
    resultSummary: "Gabriel Santos venceu por 2-1 e assumiu o Rank #1 do ranking!"
  },
  {
    id: "c-099",
    challengerId: "p6",
    challengedId: "p3",
    challengerName: "Bruno Ferreira",
    challengedName: "Matheus Lima",
    challengerRank: 6,
    challengedRank: 3,
    challengerLevel: 3,
    challengedLevel: 2,
    status: "completed",
    scheduledDate: "2026-07-20",
    completedDate: "2026-07-20",
    weekNumber: 2,
    games: [
      { challengerScore: 21, challengedScore: 15 },
      { challengerScore: 21, challengedScore: 14 }
    ],
    winnerId: "p6",
    resultSummary: "Bruno Ferreira venceu por 2-0 e subiu para o Nível 2!"
  }
];
