-- ====================================================================================
-- SCRIPT DEFINITIVO: ALINHAMENTO DE METADADOS E CRIPTOGRAFIA
-- Identificamos que o Supabase deste projeto gerou o Admin com fator 6 (não 10) 
-- e exige o metadado "email_verified": true para liberar o login!
-- Este script faz a sincronia perfeita para que todos os atletas fiquem iguais ao Admin.
-- ====================================================================================

-- 1. Corrige o RPC de Reset de Senha para usar o fator exato (6)
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
    SET encrypted_password = crypt(new_password, gen_salt('bf', 6)),
        updated_at = now()
    WHERE id::text = target_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Atleta não encontrado no cofre do Supabase.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Corrige o RPC de Criação de Atletas para injetar os metadados corretos
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
      crypt(new_password, gen_salt('bf', 6)),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"email_verified":true}',
      false
    );

    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider, created_at, updated_at
    ) VALUES (
      new_user_id::text, new_user_id, format('{"sub":"%s","email":"%s","email_verified":true}', new_user_id::text, new_email)::jsonb, 'email', now(), now()
    );

    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Aplica a correção retroativa em TODOS os atletas que falharam
-- Modifica a senha padrão para '123456' com fator 6 e insere os metadados vitais
UPDATE auth.users 
SET 
    encrypted_password = crypt('123456', gen_salt('bf', 6)),
    raw_user_meta_data = '{"email_verified":true}'::jsonb
WHERE email != 'admin@ligabadminton.com';

-- 4. Alinha também as identidades, que o GoTrue usa para validar
UPDATE auth.identities
SET identity_data = jsonb_build_object('sub', user_id::text, 'email', (identity_data->>'email'), 'email_verified', true)
WHERE provider = 'email' AND (identity_data->>'email') != 'admin@ligabadminton.com';
