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

-- 3. Desativar RLS para permitir leitura/escrita do aplicativo
ALTER TABLE public.players DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges DISABLE ROW LEVEL SECURITY;

-- 4. Habilitar Realtime para sincronização em tempo real entre celular e computador
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
END $$;
