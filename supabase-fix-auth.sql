-- ====================================================================================
-- SCRIPT DE CORREÇÃO: HASH DE SENHAS E SINCRONIZAÇÃO DE TELEFONE
-- O Supabase Auth (GoTrue) exige um custo de criptografia maior (fator 10) para aceitar as senhas.
-- Além disso, adiciona suporte para alterar o telefone de login.
-- ====================================================================================

-- 1. Atualiza a função de resetar senha para usar o fator 10 (gen_salt('bf', 10))
CREATE OR REPLACE FUNCTION admin_reset_player_password(target_id text, new_password text)
RETURNS void AS $$
DECLARE
    caller_role text;
BEGIN
    SELECT role INTO caller_role FROM public.players WHERE id = auth.uid()::text;
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Acesso negado.';
    END IF;

    UPDATE auth.users 
    SET encrypted_password = crypt(new_password, gen_salt('bf', 10)),
        updated_at = now()
    WHERE id::text = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Atualiza a função de criar usuário com o fator 10
CREATE OR REPLACE FUNCTION admin_create_player_auth(new_email text, new_password text)
RETURNS uuid AS $$
DECLARE
    caller_role text;
    new_user_id uuid;
BEGIN
    SELECT role INTO caller_role FROM public.players WHERE id = auth.uid()::text;
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Acesso negado.';
    END IF;

    new_user_id := uuid_generate_v4();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', new_email,
      crypt(new_password, gen_salt('bf', 10)),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false
    );

    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider, created_at, updated_at
    ) VALUES (
      new_user_id::text, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id::text, new_email)::jsonb, 'email', now(), now()
    );

    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Nova função para alterar o telefone (email falso) no cofre, caso o admin edite o atleta
CREATE OR REPLACE FUNCTION admin_update_player_email(target_id text, new_email text)
RETURNS void AS $$
DECLARE
    caller_role text;
BEGIN
    SELECT role INTO caller_role FROM public.players WHERE id = auth.uid()::text;
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Acesso negado.';
    END IF;

    UPDATE auth.users 
    SET email = new_email,
        updated_at = now()
    WHERE id::text = target_id;

    UPDATE auth.identities 
    SET identity_data = format('{"sub":"%s","email":"%s"}', target_id, new_email)::jsonb,
        updated_at = now()
    WHERE user_id::text = target_id AND provider = 'email';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Corrige as senhas de todos os atletas antigos para '123456' usando o fator correto (10)
-- (Pula o admin para não deslogar você)
UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf', 10))
WHERE email != 'admin@ligabadminton.com';
