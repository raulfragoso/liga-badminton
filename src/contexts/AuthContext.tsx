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

  const handleLoginSuccess = (user: Player) => {
    setCurrentUser(user);
    showToast('Login Realizado', `Bem-vindo(a) de volta, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Sessão Encerrada', 'Você saiu da sua conta com sucesso.', 'warning');
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
