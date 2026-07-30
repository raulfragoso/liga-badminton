-- ====================================================================================
-- SCRIPT DE EMERGÊNCIA: RECRIAR ADMIN ROOT NO SUPABASE
-- O sistema antigo gerava o admin de forma invisível na memória (sem salvar no banco).
-- Este script cria um administrador real, imortal e protegido no cofre de segurança.
-- ====================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
  new_admin_id uuid := uuid_generate_v4();
  admin_email text := 'admin@ligabadminton.com';
  admin_pass text := 'admin123';
BEGIN
  -- 1. Verifica se a conta auth 'admin' já existe (pra evitar erros se rodar 2x)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    -- Força a senha de volta para admin123
    UPDATE auth.users 
    SET encrypted_password = crypt(admin_pass, gen_salt('bf'))
    WHERE email = admin_email;
    
    SELECT id INTO new_admin_id FROM auth.users WHERE email = admin_email;
  ELSE
    -- 2. Insere o Administrador no cofre Auth
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_admin_id, 'authenticated', 'authenticated', admin_email,
        crypt(admin_pass, gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        false
    );

    INSERT INTO auth.identities (
        provider_id, user_id, identity_data, provider, created_at, updated_at
    ) VALUES (
        new_admin_id::text, new_admin_id, format('{"sub":"%s","email":"%s"}', new_admin_id::text, admin_email)::jsonb, 'email', now(), now()
    );
  END IF;

  -- 3. Insere o Administrador na tabela pública de visualização
  IF NOT EXISTS (SELECT 1 FROM public.players WHERE id = new_admin_id::text) THEN
    INSERT INTO public.players (
        id, name, rank, level, role, wins, losses, status, created_at
    ) VALUES (
        new_admin_id::text, 'Administrador da Liga', 0, 0, 'admin', 0, 0, 'active', now()
    );
  END IF;

  -- 4. Garante que os privilégios estão definidos como admin supremo
  UPDATE public.players SET role = 'admin' WHERE id = new_admin_id::text;

END $$;
