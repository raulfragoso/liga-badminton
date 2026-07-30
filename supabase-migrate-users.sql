-- ====================================================================================
-- SCRIPT DE MIGRAÇÃO: PLAYERS ANTIGOS -> SUPABASE AUTH
-- Este script pega todos os atletas que foram criados ANTES do sistema de Auth
-- e cria contas reais e criptografadas para eles, para que possam logar.
-- ====================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
    r RECORD;
    new_user_id uuid;
    clean_phone text;
    fake_email text;
    user_pass text;
BEGIN
    FOR r IN SELECT * FROM public.players LOOP
        -- Se o ID já for um UUID (formato novo gerado pelo Auth), pula ele
        IF r.id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
            CONTINUE;
        END IF;

        -- 1. Gera novo UUID para o usuário
        new_user_id := uuid_generate_v4();
        
        -- 2. Converte telefone para o email interno do sistema
        clean_phone := regexp_replace(COALESCE(r.phone, ''), '\D', '', 'g');
        IF clean_phone = '' AND r.role = 'admin' THEN
            fake_email := 'admin@ligabadminton.com';
        ELSIF clean_phone = '' THEN
            -- Se não tiver telefone, cria um email fake temporário
            fake_email := 'user_' || md5(random()::text) || '@ligabadminton.com';
        ELSE
            fake_email := clean_phone || '@ligabadminton.com';
        END IF;

        -- 3. Define a senha padrão (Admin ganha a senha 'admin123', os atletas '123456')
        -- Assim o Admin consegue entrar, e depois pode gerar senhas novas via painel
        IF r.role = 'admin' THEN
           user_pass := 'admin123';
        ELSE
           user_pass := '123456';
        END IF;

        -- 4. Insere o usuário na tabela oficial do Supabase Auth (caso não exista)
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = fake_email) THEN
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                new_user_id, 'authenticated', 'authenticated', fake_email,
                crypt(user_pass, gen_salt('bf')),
                now(), now(), now(),
                '{"provider":"email","providers":["email"]}',
                '{}',
                false
            );

            INSERT INTO auth.identities (
                provider_id, user_id, identity_data, provider, created_at, updated_at
            ) VALUES (
                new_user_id::text, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id::text, fake_email)::jsonb, 'email', now(), now()
            );

            -- 5. Atualiza o ID do atleta na tabela players
            UPDATE public.players SET id = new_user_id::text WHERE id = r.id;

            -- 6. Cascata de atualização: atualiza o ID em todos os jogos (Desafios)
            UPDATE public.challenges SET challenger_id = new_user_id::text WHERE challenger_id = r.id;
            UPDATE public.challenges SET challenged_id = new_user_id::text WHERE challenged_id = r.id;
            UPDATE public.challenges SET winner_id = new_user_id::text WHERE winner_id = r.id;
        END IF;
    END LOOP;
END $$;
