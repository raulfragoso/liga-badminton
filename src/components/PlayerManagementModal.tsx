import React, { useState } from 'react';
import { Player } from '../types/league';
import { getDefaultPasswordFromPhone, formatPhoneMask, sanitizePhone } from '../utils/auth';
import { UserPlus, X, Phone, User, CheckCircle2, Lock, Key } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useLeague } from '../contexts/LeagueContext';
import { useUI } from '../contexts/UIContext';

export const PlayerManagementModal: React.FC = () => {
  const { players, handleAddPlayer } = useLeague();
  const { isPlayerModalOpen: isOpen, setIsPlayerModalOpen } = useUI();
  const onClose = () => setIsPlayerModalOpen(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customPassword, setCustomPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Sanitiza o telefone para salvar estritamente como string com os 11 dígitos numéricos
    const cleanPhoneDigits = sanitizePhone(phone);
    if (!cleanPhoneDigits) {
      alert("Telefone inválido.");
      return;
    }

    const defaultPhonePass = getDefaultPasswordFromPhone(cleanPhoneDigits);
    const generatedPass = customPassword.trim() || defaultPhonePass;

    try {
      let newPlayerId = `p-${Date.now()}`;

      // Tenta criar na nuvem primeiro
      const { supabase, formatPhoneToEmail, isSupabaseConfigured } = await import('../utils/supabaseClient');
      
      if (isSupabaseConfigured && supabase) {
        const fakeEmail = formatPhoneToEmail(cleanPhoneDigits);
        
        // Usa o RPC recém criado para o Admin injetar um usuário no Auth sem deslogar
        const { data: newUuid, error } = await supabase.rpc('admin_create_player_auth', { 
          new_email: fakeEmail, 
          new_password: generatedPass 
        });
        
        if (error) {
          alert(`Erro ao criar acesso seguro: ${error.message}`);
          return;
        }
        if (newUuid) {
          newPlayerId = newUuid;
        }
      }

      // Todos os atletas ingressam inicialmente no Nível 1
      const nextRank = players.length + 1;

      const newPlayer: Player = {
        id: newPlayerId,
        name: name.trim(),
        rank: nextRank,
        level: 1, 
        phone: cleanPhoneDigits,
        role: 'athlete',
        wins: 0,
        losses: 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };

      handleAddPlayer(newPlayer);
      setName('');
      setPhone('');
      setCustomPassword('');
      onClose();
      
      alert(`Atleta criado com sucesso!\nLogin: ${cleanPhoneDigits}\nSenha: ${generatedPass}`);
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao registrar o atleta.');
    }
  };

  const defaultPhonePassPreview = phone ? getDefaultPasswordFromPhone(phone) : '4 últimos dígitos do fone';
  const tempPreviewPass = customPassword.trim() || `${defaultPhonePassPreview} (Senha padrão do fone)`;

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
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nome Completo do Atleta"
            leftIcon={<User className="w-4 h-4" />}
            type="text"
            required
            placeholder="Ex: Carlos Eduardo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Telefone / WhatsApp (Login do Atleta)"
            leftIcon={<Phone className="w-4 h-4" />}
            type="text"
            required
            maxLength={15}
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
          />

          <Input
            label="Senha de Acesso (Padrão: 4 últimos dígitos do telefone)"
            leftIcon={<Lock className="w-4 h-4" />}
            type="text"
            placeholder="Deixe em branco para usar os 4 últimos dígitos do fone"
            value={customPassword}
            onChange={(e) => setCustomPassword(e.target.value)}
            className="font-mono"
          />

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
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <CheckCircle2 className="w-4 h-4" />
              Adicionar Atleta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
