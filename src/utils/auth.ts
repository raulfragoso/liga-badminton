import { Player } from '../types/league';

export interface AuthResult {
  success: boolean;
  user: Player | null;
  errorMessage?: string;
}

/**
 * Remove caracteres não numéricos de um telefone para armazenamento (retorna apenas dígitos).
 */
export function sanitizePhone(phone: string = ''): string {
  let digits = phone.replace(/\D/g, '');
  // Remove código de país 55 (Brasil) se tiver 12 ou 13 dígitos
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  // Se tiver mais de 11 dígitos por algum motivo, pega os últimos 11 (DDD + Número)
  if (digits.length > 11) {
    digits = digits.slice(-11);
  }
  return digits;
}

/**
 * Formata dinamicamente a entrada de telefone no formato visual (NN) NNNNN-NNNN.
 */
export function formatPhoneMask(value: string = ''): string {
  const digits = sanitizePhone(value);
  if (!digits) return '';
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Formata uma string de 11 dígitos armazenada no banco para exibição (NN) NNNNN-NNNN.
 */
export function formatPhoneDisplay(phone: string = ''): string {
  const digits = sanitizePhone(phone);
  if (digits.length !== 11) return phone || '';
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Extrai os 4 últimos dígitos do telefone para usar como senha padrão de novos atletas.
 * Exemplo: "(11) 98765-4321" -> "4321"
 */
export function getDefaultPasswordFromPhone(phone: string = ''): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 4) {
    return digits.slice(-4);
  }
  return digits || '1234';
}

/**
 * Gera uma senha aleatória para envio ao atleta (ou usa os 4 últimos dígitos se fornecido).
 */
export function generateRandomPassword(phone?: string): string {
  if (phone) {
    const defaultPass = getDefaultPasswordFromPhone(phone);
    if (defaultPass) return defaultPass;
  }
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'MB-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Valida o formulário e autentica um atleta ou administrador pelo telefone/login e senha.
 */
export function validateAndAuthenticateUser(
  players: Player[],
  phoneInput: string,
  passwordInput: string
): AuthResult {
  const targetPlayersList = players || [];

  const trimmedInput = (phoneInput || '').trim();
  const cleanPhone = sanitizePhone(phoneInput);
  const enteredPassword = (passwordInput || '').trim();

  if (!trimmedInput) {
    return {
      success: false,
      user: null,
      errorMessage: 'Por favor, informe o telefone de login ou o usuário "admin".'
    };
  }

  if (!enteredPassword) {
    return {
      success: false,
      user: null,
      errorMessage: 'Por favor, informe a senha de acesso.'
    };
  }

  // Obter credenciais master do administrador via variáveis de ambiente da Vercel/Vite
  const rawEnvPassword = (import.meta.env.VITE_ADMIN_PASSWORD || '').trim();
  const rawEnvPhone = (import.meta.env.VITE_ADMIN_PHONE || '').trim();

  const masterAdminPassword = rawEnvPassword;
  const masterAdminPhone = rawEnvPhone || 'admin';
  const cleanMasterPhone = sanitizePhone(masterAdminPhone);

  // Verificar se o usuário está tentando entrar como "admin" ou pelo telefone master configurado
  const isTargetingAdmin =
    trimmedInput.toLowerCase() === 'admin' ||
    trimmedInput.toLowerCase() === 'administrador' ||
    (cleanMasterPhone.length > 0 && cleanPhone === cleanMasterPhone) ||
    (masterAdminPhone.length > 0 && trimmedInput.toLowerCase() === masterAdminPhone.toLowerCase());

  let foundPlayer: Player | undefined;

  if (isTargetingAdmin) {
    // Buscar o jogador admin ou criar conta admin padrão caso o banco esteja limpo
    foundPlayer = targetPlayersList.find(p => p.role === 'admin') || targetPlayersList[0];
    if (foundPlayer) {
      foundPlayer.role = 'admin';
    } else {
      foundPlayer = {
        id: 'admin-master',
        name: 'Administrador da Liga',
        rank: 1,
        level: 1,
        role: 'admin',
        password: masterAdminPassword,
        wins: 0,
        losses: 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };
    }
  } else {
    // Busca ultra flexível por telefone sanitizado, sufixo de 8 dígitos ou nome do atleta
    const inputDigitsOnly = trimmedInput.replace(/\D/g, '');
    const inputLast8 = inputDigitsOnly.length >= 8 ? inputDigitsOnly.slice(-8) : '';
    const inputLower = trimmedInput.toLowerCase().trim();

    foundPlayer = targetPlayersList.find(p => {
      const playerCleanPhone = sanitizePhone(p.phone || '');
      const playerDigitsOnly = (p.phone || '').replace(/\D/g, '');
      const playerLast8 = playerDigitsOnly.length >= 8 ? playerDigitsOnly.slice(-8) : '';
      const playerNameLower = (p.name || '').toLowerCase().trim();

      const matchesName = playerNameLower.length > 0 && inputLower.length >= 2 && (
        playerNameLower === inputLower ||
        playerNameLower.startsWith(inputLower) ||
        inputLower.startsWith(playerNameLower)
      );

      const matchesPhone = (
        (playerCleanPhone.length > 0 && cleanPhone.length > 0 && (
          playerCleanPhone === cleanPhone ||
          playerCleanPhone.endsWith(cleanPhone) ||
          cleanPhone.endsWith(playerCleanPhone)
        )) ||
        (playerLast8.length >= 8 && inputLast8.length >= 8 && playerLast8 === inputLast8)
      );

      return matchesName || matchesPhone;
    });
  }

  if (!foundPlayer) {
    console.warn('[Liga Badminton Auth] Usuário não encontrado para:', trimmedInput, 'Total de atletas analisados:', targetPlayersList.length);

    return {
      success: false,
      user: null,
      errorMessage: `Nenhum atleta foi encontrado com o login "${trimmedInput}". Verifique o número digitado ou faça o cadastro.`
    };
  }

  const isAdminUser = foundPlayer.role === 'admin' || isTargetingAdmin;

  // Validar a senha de acesso (aceita a senha do banco, os 4 últimos dígitos do telefone ou master)
  const enteredPassLower = enteredPassword.toLowerCase();
  const masterPassLower = masterAdminPassword.toLowerCase();
  const rawEnvPassLower = rawEnvPassword.toLowerCase();
  const playerPassLower = (foundPlayer.password || '').toLowerCase();

  const playerPhoneDefaultPass = getDefaultPasswordFromPhone(foundPlayer.phone || '');
  const inputPhoneDefaultPass = getDefaultPasswordFromPhone(trimmedInput);

  const isValidPassword =
    (masterAdminPassword.length > 0 && (enteredPassword === masterAdminPassword || enteredPassLower === masterPassLower)) ||
    (rawEnvPassword.length > 0 && (enteredPassword === rawEnvPassword || enteredPassLower === rawEnvPassLower)) ||
    enteredPassword === foundPlayer.password ||
    enteredPassLower === playerPassLower ||
    (playerPhoneDefaultPass.length > 0 && (enteredPassword === playerPhoneDefaultPass || enteredPassLower === playerPhoneDefaultPass.toLowerCase())) ||
    (inputPhoneDefaultPass.length > 0 && (enteredPassword === inputPhoneDefaultPass || enteredPassLower === inputPhoneDefaultPass.toLowerCase()));

  // Log de depuração no console do navegador (F12) para diagnosticar Vercel env vars
  console.log('[Liga Badminton Auth Debug]', {
    loginInformado: trimmedInput,
    isTargetingAdmin,
    isAdminUser,
    hasViteEnvPassword: Boolean(rawEnvPassword),
    envPasswordLength: rawEnvPassword.length,
    usuarioEncontrado: foundPlayer.name,
    autenticadoComSucesso: isValidPassword
  });

  if (!isValidPassword) {
    return {
      success: false,
      user: null,
      errorMessage: 'Senha de acesso incorreta. Verifique a senha configurada ou tente novamente.'
    };
  }

  return {
    success: true,
    user: foundPlayer
  };
}

/**
 * Autenticação legada simples
 */
export function authenticateUser(
  players: Player[],
  phoneInput: string,
  passwordInput: string
): Player | null {
  const result = validateAndAuthenticateUser(players, phoneInput, passwordInput);
  return result.user;
}
