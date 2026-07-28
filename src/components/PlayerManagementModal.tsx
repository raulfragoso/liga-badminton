import React, { useState } from 'react';
import { Player } from '../types/league';
import { generateRandomPassword, formatPhoneMask, sanitizePhone } from '../utils/auth';
import { UserPlus, X, Phone, User, CheckCircle2, Lock, Key } from 'lucide-react';

interface PlayerManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onAddPlayer: (newPlayer: Player) => void;
}

export const PlayerManagementModal: React.FC<PlayerManagementModalProps> = ({
  isOpen,
  onClose,
  players,
  onAddPlayer,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customPassword, setCustomPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Sanitiza o telefone para salvar estritamente como string com os 11 dígitos numéricos
    const cleanPhoneDigits = sanitizePhone(phone);

    // Todos os atletas ingressam inicialmente no Nível 1
    const nextRank = players.length + 1;
    const generatedPass = customPassword.trim() || generateRandomPassword();

    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      name: name.trim(),
      rank: nextRank,
      level: 1, // Novo atleta ingressa sempre no Nível 1 (mínimo)
      phone: cleanPhoneDigits || undefined,
      password: generatedPass,
      role: 'athlete',
      wins: 0,
      losses: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddPlayer(newPlayer);
    setName('');
    setPhone('');
    setCustomPassword('');
    onClose();
  };

  const tempPreviewPass = customPassword.trim() || 'MB-XXXX (Gerada automaticamente)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-700 bg-slate-900/90 shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/30 text-orange-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cadastrar Novo Atleta</h3>
              <p className="text-xs text-slate-400">Entrada no Nível 1 (Nível Base de Entrada)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-400" />
              Nome Completo do Atleta
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Carlos Eduardo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              Telefone / WhatsApp (Login do Atleta)
            </label>
            <input
              type="text"
              required
              maxLength={15}
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-orange-400" />
              Senha de Acesso (Opcional - Gerada automaticamente se vazia)
            </label>
            <input
              type="text"
              placeholder="Deixe em branco para gerar aleatória"
              value={customPassword}
              onChange={(e) => setCustomPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>

          {/* Card informando a senha gerada */}
          <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/30 text-xs text-orange-300 flex items-center gap-2">
            <Key className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <span className="font-bold block">Senha de Login do Atleta:</span>
              <span className="font-mono text-white text-sm font-bold">{tempPreviewPass}</span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Adicionar Atleta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
