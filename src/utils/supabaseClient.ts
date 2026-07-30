import { createClient } from '@supabase/supabase-js';
import { Player, Challenge, LeagueSettings } from '../types/league';

// Buscar variáveis de ambiente do Vite ou fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Converte um objeto de atleta para o formato da tabela de banco de dados 'players'
 */
function mapPlayerToDb(p: Player) {
  return {
    id: p.id,
    name: p.name,
    rank: p.rank,
    level: p.level || 1,
    phone: p.phone || null,
    role: p.role || 'athlete',
    wins: p.wins || 0,
    losses: p.losses || 0,
    status: p.status || 'active',
    cooldown_until: p.cooldownUntil || null,
    cooldown_reason: p.cooldownReason || null,
    last_challenge_week: p.lastChallengeWeek || null,
    created_at: p.createdAt || new Date().toISOString().split('T')[0]
  };
}

/**
 * Converte uma linha da tabela 'players' para a interface de Player da aplicação
 */
function mapDbToPlayer(row: any): Player {
  return {
    id: row.id,
    name: row.name,
    rank: row.rank,
    level: row.level || 1,
    phone: row.phone || undefined,
    role: row.role || 'athlete',
    wins: row.wins || 0,
    losses: row.losses || 0,
    status: row.status || 'active',
    cooldownUntil: row.cooldown_until || undefined,
    cooldownReason: row.cooldown_reason || undefined,
    lastChallengeWeek: row.last_challenge_week || undefined,
    createdAt: row.created_at || new Date().toISOString().split('T')[0]
  };
}

/**
 * Converte um desafio para o formato da tabela de banco de dados 'challenges'
 */
function mapChallengeToDb(c: Challenge) {
  return {
    id: c.id,
    challenger_id: c.challengerId,
    challenged_id: c.challengedId,
    challenger_name: c.challengerName,
    challenged_name: c.challengedName,
    challenger_rank: c.challengerRank,
    challenged_rank: c.challengedRank,
    challenger_level: c.challengerLevel || 1,
    challenged_level: c.challengedLevel || 1,
    status: c.status,
    scheduled_date: c.scheduledDate,
    completed_date: c.completedDate || null,
    week_number: c.weekNumber,
    games: c.games ? JSON.stringify(c.games) : null,
    winner_id: c.winnerId || null,
    result_summary: c.resultSummary || null,
    notes: c.notes || null
  };
}

/**
 * Converte uma linha da tabela 'challenges' para a interface Challenge da aplicação
 */
function mapDbToChallenge(row: any): Challenge {
  let parsedGames = undefined;
  if (row.games) {
    parsedGames = typeof row.games === 'string' ? JSON.parse(row.games) : row.games;
  }

  return {
    id: row.id,
    challengerId: row.challenger_id,
    challengedId: row.challenged_id,
    challengerName: row.challenger_name,
    challengedName: row.challenged_name,
    challengerRank: row.challenger_rank,
    challengedRank: row.challenged_rank,
    challengerLevel: row.challenger_level || 1,
    challengedLevel: row.challenged_level || 1,
    status: row.status,
    scheduledDate: row.scheduled_date,
    completedDate: row.completed_date || undefined,
    weekNumber: row.week_number,
    games: parsedGames,
    winnerId: row.winner_id || undefined,
    resultSummary: row.result_summary || undefined,
    notes: row.notes || undefined
  };
}

// --- FUNÇÕES DE AUTENTICAÇÃO (SUPABASE AUTH) ---

export function formatPhoneToEmail(phone: string): string {
  // Limpa tudo que não for número e anexa o domínio falso
  const cleanNumber = phone.replace(/\D/g, '');
  return `${cleanNumber}@ligabadminton.com`;
}

// --- FUNÇÕES DE BUSCA E PERSISTÊNCIA NA NUVEM ---

export async function fetchPlayersFromSupabase(): Promise<Player[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('players').select('*').order('rank', { ascending: true });
    if (error || !data) {
      console.warn('Erro ao buscar players do Supabase:', error);
      return null;
    }
    return data.map(mapDbToPlayer);
  } catch (err) {
    console.error('Falha na comunicação com o Supabase:', err);
    return null;
  }
}

export async function saveAllPlayersToSupabase(players: Player[]): Promise<boolean> {
  if (!supabase || players.length === 0) return false;
  try {
    const dbPayload = players.map(mapPlayerToDb);
    const { error } = await supabase.from('players').upsert(dbPayload);
    if (error) {
      console.error('Erro ao salvar atletas no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha ao salvar atletas no Supabase:', err);
    return false;
  }
}

export async function saveSinglePlayerToSupabase(player: Player): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbPayload = mapPlayerToDb(player);
    const { error } = await supabase.from('players').upsert(dbPayload);
    if (error) {
      console.error('Erro ao salvar atleta no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha ao salvar atleta no Supabase:', err);
    return false;
  }
}

export async function deletePlayerFromSupabase(playerId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('players').delete().eq('id', playerId);
    if (error) {
      console.error('Erro ao deletar atleta do Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha ao deletar atleta do Supabase:', err);
    return false;
  }
}

export async function fetchChallengesFromSupabase(): Promise<Challenge[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('challenges').select('*').order('week_number', { ascending: false });
    if (error || !data) {
      console.warn('Erro ao buscar desafios do Supabase:', error);
      return null;
    }
    return data.map(mapDbToChallenge);
  } catch (err) {
    console.error('Falha na comunicação com o Supabase:', err);
    return null;
  }
}

export async function saveAllChallengesToSupabase(challenges: Challenge[]): Promise<boolean> {
  if (!supabase || challenges.length === 0) return false;
  try {
    const dbPayload = challenges.map(mapChallengeToDb);
    const { error } = await supabase.from('challenges').upsert(dbPayload);
    if (error) {
      console.error('Erro ao salvar desafios no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha ao salvar desafios no Supabase:', err);
    return false;
  }
}

export async function saveSingleChallengeToSupabase(challenge: Challenge): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbPayload = mapChallengeToDb(challenge);
    const { error } = await supabase.from('challenges').upsert(dbPayload);
    if (error) {
      console.error('Erro ao salvar desafio no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha ao salvar desafio no Supabase:', err);
    return false;
  }
}

export async function deleteChallengeFromSupabase(challengeId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('challenges').delete().eq('id', challengeId);
    if (error) {
      console.error('Erro ao deletar desafio do Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha ao deletar desafio no Supabase:', err);
    return false;
  }
}

export async function deleteAllDataFromSupabase(): Promise<boolean> {
  if (!supabase) return false;
  try {
    await supabase.from('challenges').delete().neq('id', '0');
    await supabase.from('players').delete().neq('id', '0');
    return true;
  } catch (err) {
    console.error('Erro ao limpar Supabase:', err);
    return false;
  }
}

/**
 * Converte as configurações da liga para o formato da tabela 'league_settings'
 */
function mapSettingsToDb(s: LeagueSettings) {
  return {
    id: 'default',
    name: s.name,
    season_start_date: s.seasonStartDate,
    season_end_date: s.seasonEndDate,
    current_week: s.currentWeek,
    max_refusals_without_penalty: s.maxRefusalsWithoutPenalty,
    updated_at: new Date().toISOString()
  };
}

/**
 * Converte uma linha da tabela 'league_settings' para a interface LeagueSettings da aplicação
 */
function mapDbToSettings(row: any): LeagueSettings {
  return {
    name: row.name || "Liga de Badminton - Complexo Esportivo Maylson Campos",
    seasonStartDate: row.season_start_date || "2026-07-01",
    seasonEndDate: row.season_end_date || "2026-09-30",
    currentWeek: row.current_week || 1,
    maxRefusalsWithoutPenalty: row.max_refusals_without_penalty || 1
  };
}

export async function fetchSettingsFromSupabase(): Promise<LeagueSettings | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('league_settings').select('*').eq('id', 'default').single();
    if (error || !data) {
      return null;
    }
    return mapDbToSettings(data);
  } catch (err) {
    console.error('Erro ao buscar configurações do Supabase:', err);
    return null;
  }
}

export async function saveSettingsToSupabase(settings: LeagueSettings): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbPayload = mapSettingsToDb(settings);
    const { error } = await supabase.from('league_settings').upsert(dbPayload);
    if (error) {
      console.error('Erro ao salvar configurações no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha ao salvar configurações no Supabase:', err);
    return false;
  }
}

/**
 * Assina atualizações Realtime do Supabase em tempo real para todos os dispositivos conectados
 */
export function subscribeToSupabaseRealtime(
  onPlayersChange: (players: Player[]) => void,
  onChallengesChange: (challenges: Challenge[]) => void,
  onSettingsChange?: (settings: LeagueSettings) => void
) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('schema-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, async () => {
      const updatedPlayers = await fetchPlayersFromSupabase();
      if (updatedPlayers) onPlayersChange(updatedPlayers);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, async () => {
      const updatedChallenges = await fetchChallengesFromSupabase();
      if (updatedChallenges) onChallengesChange(updatedChallenges);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'league_settings' }, async () => {
      const updatedSettings = await fetchSettingsFromSupabase();
      if (updatedSettings && onSettingsChange) onSettingsChange(updatedSettings);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
