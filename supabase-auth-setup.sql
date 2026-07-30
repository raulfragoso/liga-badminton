-- ====================================================================================
-- SUPABASE AUTH & RLS CONFIGURATION SCRIPT
-- Copie e cole este código no SQL Editor do seu projeto no Supabase (https://supabase.com)
-- Execute este script para habilitar a segurança (Auth) e as muralhas (RLS).
-- ====================================================================================

-- 1. Remove coluna de senha legada em texto plano da tabela publica 'players'
ALTER TABLE public.players DROP COLUMN IF EXISTS password;

-- 2. Habilita RLS (Row Level Security) em todas as tabelas
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_settings ENABLE ROW LEVEL SECURITY;

-- ====================================================================================
-- POLÍTICAS DA TABELA 'players'
-- ====================================================================================

-- Qualquer pessoa pode ler a lista de atletas (necessário para ver a pirâmide sem estar logado)
CREATE POLICY "Leitura Pública de Atletas" ON public.players
  FOR SELECT USING (true);

-- Atletas só podem editar seu PRÓPRIO registro ou Admin pode editar qualquer registro
-- Usa o email do auth.users (que mapeia o telefone) vs phone da tabela para autenticar o dono, ou verifica admin
-- Como não é trivial ler de auth.users durante a policy de insert rápida, vamos checar pelo ID
CREATE POLICY "Usuário pode editar a si mesmo ou Admin edita todos" ON public.players
  FOR UPDATE USING (
    auth.uid()::text = id 
    OR 
    (SELECT role FROM public.players WHERE id = auth.uid()::text) = 'admin'
  );

-- Admins podem inserir ou deletar atletas
CREATE POLICY "Admin pode inserir atletas" ON public.players
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.players WHERE id = auth.uid()::text) = 'admin'
  );

CREATE POLICY "Admin pode deletar atletas" ON public.players
  FOR DELETE USING (
    (SELECT role FROM public.players WHERE id = auth.uid()::text) = 'admin'
  );

-- ====================================================================================
-- POLÍTICAS DA TABELA 'challenges'
-- ====================================================================================

-- Qualquer pessoa pode ler o histórico de jogos
CREATE POLICY "Leitura Pública de Desafios" ON public.challenges
  FOR SELECT USING (true);

-- Apenas o desafiante ou o desafiado logado pode criar um desafio, ou um Admin
CREATE POLICY "Atletas envolvidos podem inserir jogos" ON public.challenges
  FOR INSERT WITH CHECK (
    auth.uid()::text = challenger_id 
    OR 
    auth.uid()::text = challenged_id
    OR
    (SELECT role FROM public.players WHERE id = auth.uid()::text) = 'admin'
  );

-- Apenas envolvidos ou Admin podem atualizar jogos
CREATE POLICY "Atletas envolvidos ou Admin podem atualizar jogos" ON public.challenges
  FOR UPDATE USING (
    auth.uid()::text = challenger_id 
    OR 
    auth.uid()::text = challenged_id
    OR
    (SELECT role FROM public.players WHERE id = auth.uid()::text) = 'admin'
  );

-- Apenas envolvidos ou Admin podem deletar jogos
CREATE POLICY "Atletas envolvidos ou Admin podem deletar jogos" ON public.challenges
  FOR DELETE USING (
    auth.uid()::text = challenger_id 
    OR 
    auth.uid()::text = challenged_id
    OR
    (SELECT role FROM public.players WHERE id = auth.uid()::text) = 'admin'
  );

-- ====================================================================================
-- POLÍTICAS DA TABELA 'league_settings'
-- ====================================================================================

CREATE POLICY "Leitura Pública das Configurações" ON public.league_settings
  FOR SELECT USING (true);

-- Somente admin pode alterar configurações
CREATE POLICY "Apenas Admin altera configurações" ON public.league_settings
  FOR UPDATE USING (
    (SELECT role FROM public.players WHERE id = auth.uid()::text) = 'admin'
  );

CREATE POLICY "Apenas Admin insere configurações" ON public.league_settings
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.players WHERE id = auth.uid()::text) = 'admin'
  );

-- ====================================================================================
-- FUNÇÃO RPC PARA ADMIN REDEFINIR SENHA DOS ATLETAS
-- (Substitui o botão de senha da versão anterior)
-- ====================================================================================

-- Esta função usa `security definer` para rodar com privilégios de superusuário do banco
-- E injeta a nova senha usando as funções internas pgcrypto do Supabase auth
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION admin_reset_player_password(target_id text, new_password text)
RETURNS void AS $$
DECLARE
    caller_role text;
BEGIN
    -- 1. Verifica se quem chamou a função é um Admin ativo
    SELECT role INTO caller_role FROM public.players WHERE id = auth.uid()::text;
    
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem redefinir senhas.';
    END IF;

    -- 2. Atualiza a senha no schema auth do Supabase
    -- Supabase usa o campo encrypted_password
    UPDATE auth.users 
    SET encrypted_password = crypt(new_password, gen_salt('bf'))
    WHERE id::text = target_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Atleta não encontrado no cofre de autenticação.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================================
-- FUNÇÃO RPC PARA ADMIN CRIAR NOVO ATLETA DIRETAMENTE NO COFRE
-- ====================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION admin_create_player_auth(new_email text, new_password text)
RETURNS uuid AS $$
DECLARE
    caller_role text;
    new_user_id uuid;
BEGIN
    -- Verifica admin
    SELECT role INTO caller_role FROM public.players WHERE id = auth.uid()::text;
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem criar atletas.';
    END IF;

    -- Gera novo UUID
    new_user_id := uuid_generate_v4();

    -- Insere no cofre auth.users
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', new_email,
      crypt(new_password, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false
    );

    -- Insere identidade
    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider, created_at, updated_at
    ) VALUES (
      new_user_id::text, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id::text, new_email)::jsonb, 'email', now(), now()
    );

    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
