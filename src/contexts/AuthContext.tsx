import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player } from '../types/league';
import { useUI } from './UIContext';

interface AuthContextProps {
  currentUser: Player | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<Player | null>>;
  isAdmin: boolean;
  handleLoginSuccess: (user: Player) => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { showToast } = useUI();

  const [currentUser, setCurrentUser] = useState<Player | null>(() => {
    const saved = localStorage.getItem('badminton_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAdmin = currentUser?.role === 'admin';

  // Sincroniza usuário com localStorage sempre que mudar
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('badminton_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('badminton_current_user');
    }
  }, [currentUser]);

  // Sincroniza estado de autenticação real com o Supabase
  useEffect(() => {
    import('../utils/supabaseClient').then(({ supabase }) => {
      if (!supabase) return;

      // Escuta mudanças (ex: token expirou, logout em outra aba)
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setCurrentUser(null);
        }
      });

      // Validação inicial
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setCurrentUser(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    });
  }, []);

  const handleLoginSuccess = (user: Player) => {
    setCurrentUser(user);
    showToast('Login Realizado', `Bem-vindo(a) de volta, ${user.name}!`);
  };

  const handleLogout = async () => {
    try {
      const { supabase } = await import('../utils/supabaseClient');
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Erro silencioso no Supabase signOut:', err);
    } finally {
      // Garante que o estado local e o cache sejam destruídos independentemente do Supabase
      setCurrentUser(null);
      localStorage.removeItem('badminton_current_user');
      showToast('Sessão Encerrada', 'Você saiu da sua conta com sucesso.', 'warning');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAdmin,
        handleLoginSuccess,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
