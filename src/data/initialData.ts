import { Player, Challenge, LeagueSettings } from '../types/league';

export const INITIAL_SETTINGS: LeagueSettings = {
  name: "Liga de Badminton - Complexo Esportivo Maylson Campos",
  seasonStartDate: "2026-07-01",
  seasonEndDate: "2026-09-30",
  currentWeek: 1,
  maxRefusalsWithoutPenalty: 1
};

// Banco de dados limpo por padrão - Exibe apenas o que estiver cadastrado no Supabase
export const INITIAL_PLAYERS: Player[] = [];
export const INITIAL_CHALLENGES: Challenge[] = [];
