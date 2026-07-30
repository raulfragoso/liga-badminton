-- ====================================================================================
-- SCRIPT DE PATCH: PREENCHIMENTO DE CAMPOS VAZIOS (NULL -> '')
-- O erro "{}" significa que o servidor GoTrue (escrito em Go) entrou em "pânico" (crash)
-- ao tentar ler a linha do usuário e encontrar valores NULL onde ele esperava uma String Vazia ''.
-- Este script limpa esses valores nulos para todos os atletas e previne o crash no servidor.
-- ====================================================================================

-- 1. Preenche os campos nulos que causam crash no motor do Supabase
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone = COALESCE(phone, '')
WHERE email != 'admin@ligabadminton.com';

-- 2. Atualiza o RPC de criação para já inserir os campos como strings vazias no futuro
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
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, 
      raw_app_meta_data, raw_user_meta_data, is_super_admin,
      confirmation_token, recovery_token, email_change_token_new, email_change, phone_change, phone_change_token, email_change_token_current, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', new_email,
      crypt(new_password, gen_salt('bf', 6)),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"email_verified":true}',
      false,
      '', '', '', '', '', '', '', ''
    );

    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider, created_at, updated_at
    ) VALUES (
      new_user_id::text, new_user_id, format('{"sub":"%s","email":"%s","email_verified":true}', new_user_id::text, new_email)::jsonb, 'email', now(), now()
    );

    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
