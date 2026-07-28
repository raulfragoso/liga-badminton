import { Player } from '../types/league';
import { sanitizePhone } from './auth';

/**
 * Gera a URL oficial do WhatsApp (wa.me) pré-formatada para notificar o atleta desafiado.
 */
export function formatWhatsappChallengeUrl(
  challengerName: string,
  challengerLevel: number,
  challengedName: string,
  challengedPhone: string = '',
  challengedLevel: number,
  weekNumber: number,
  scheduledTimeStr?: string
): string {
  const cleanPhone = sanitizePhone(challengedPhone);
  // Adiciona o código de país 55 (Brasil) caso tenha 10 ou 11 dígitos
  const phoneWithCountry = cleanPhone.length === 10 || cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;

  const timeText = scheduledTimeStr ? `\n⏰ *Data/Horário:* ${scheduledTimeStr}` : '';

  const text = `*Liga de Badminton - Novo Desafio!* 🏸\n\n` +
    `Olá *${challengedName}*! 👋\n\n` +
    `Você acabou de ser desafiado por *${challengerName}* na *Liga de Badminton do Complexo Maylson Campos*!\n\n` +
    `⚔️ *Confronto:* ${challengerName} (Nível ${challengerLevel}) vs ${challengedName} (Nível ${challengedLevel})\n` +
    `📅 *Semana:* ${weekNumber}` +
    `${timeText}\n\n` +
    `Acesse o sistema para visualizar e responder:\nhttps://liga-badminton.vercel.app`;

  if (phoneWithCountry) {
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
  }
  
  // Fallback se não houver número do telefone do desafiado
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Dispara a notificação via WhatsApp abrindo o link wa.me em uma nova aba do navegador.
 */
export function sendWhatsappNotification(
  challenger: Player,
  challenged: Player,
  weekNumber: number,
  scheduledTimeStr?: string
) {
  const url = formatWhatsappChallengeUrl(
    challenger.name,
    challenger.level,
    challenged.name,
    challenged.phone || '',
    challenged.level,
    weekNumber,
    scheduledTimeStr
  );

  window.open(url, '_blank');
}
