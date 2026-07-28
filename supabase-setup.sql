-- Script de Criação e Configuração das Tabelas da Liga de Badminton no Supabase
-- Copie e cole este código no SQL Editor do seu projeto no Supabase (https://supabase.com) e clique em RUN.

-- 1. Criar Tabela de Atletas (players)
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rank INTEGER NOT NULL,
  level INTEGER DEFAULT 1,
  phone TEXT,
  password TEXT DEFAULT '123',
  role TEXT DEFAULT 'athlete',
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  cooldown_until TIMESTAMP WITH TIME ZONE,
  cooldown_reason TEXT,
  last_challenge_week INTEGER,
  created_at DATE DEFAULT CURRENT_DATE
);

-- 2. Criar Tabela de Desafios (challenges)
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  challenger_id TEXT NOT NULL,
  challenged_id TEXT NOT NULL,
  challenger_name TEXT NOT NULL,
  challenged_name TEXT NOT NULL,
  challenger_rank INTEGER NOT NULL,
  challenged_rank INTEGER NOT NULL,
  challenger_level INTEGER DEFAULT 1,
  challenged_level INTEGER DEFAULT 1,
  status TEXT NOT NULL,
  scheduled_date TEXT,
  completed_date TEXT,
  week_number INTEGER NOT NULL,
  games JSONB,
  winner_id TEXT,
  result_summary TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar Tabela de Configurações da Liga (league_settings)
CREATE TABLE IF NOT EXISTS public.league_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL,
  season_start_date TEXT NOT NULL,
  season_end_date TEXT NOT NULL,
  current_week INTEGER DEFAULT 1,
  max_refusals_without_penalty INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir registro padrão inicial se a tabela estiver nova
INSERT INTO public.league_settings (id, name, season_start_date, season_end_date, current_week, max_refusals_without_penalty)
VALUES ('default', 'Liga de Badminton - Complexo Esportivo Maylson Campos', '2026-07-01', '2026-09-30', 1, 1)
ON CONFLICT (id) DO NOTHING;

-- 4. Desativar RLS para permitir leitura/escrita do aplicativo
ALTER TABLE public.players DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_settings DISABLE ROW LEVEL SECURITY;

-- 5. Habilitar Realtime para sincronização em tempo real entre celular e computador
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'challenges'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'league_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.league_settings;
  END IF;
END $$;
