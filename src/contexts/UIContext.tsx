import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Player, Challenge } from '../types/league';

interface ToastMessage {
  title: string;
  desc: string;
  type: 'success' | 'warning';
}

interface UIContextProps {
  // Modal states
  isNewChallengeModalOpen: boolean;
  setIsNewChallengeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMatchResultModalOpen: boolean;
  setIsMatchResultModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPlayerModalOpen: boolean;
  setIsPlayerModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isRulesModalOpen: boolean;
  setIsRulesModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isResetLeagueModalOpen: boolean;
  setIsResetLeagueModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditPlayerModalOpen: boolean;
  setIsEditPlayerModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Preselected Data
  preselectedChallenger: Player | null;
  setPreselectedChallenger: React.Dispatch<React.SetStateAction<Player | null>>;
  preselectedChallenged: Player | null;
  setPreselectedChallenged: React.Dispatch<React.SetStateAction<Player | null>>;
  selectedChallengeToResolve: Challenge | null;
  setSelectedChallengeToResolve: React.Dispatch<React.SetStateAction<Challenge | null>>;
  selectedPlayerToEdit: Player | null;
  setSelectedPlayerToEdit: React.Dispatch<React.SetStateAction<Player | null>>;

  // Toast
  toastMessage: ToastMessage | null;
  showToast: (title: string, desc: string, type?: 'success' | 'warning') => void;
  clearToast: () => void;
}

const UIContext = createContext<UIContextProps | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isNewChallengeModalOpen, setIsNewChallengeModalOpen] = useState(false);
  const [isMatchResultModalOpen, setIsMatchResultModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isResetLeagueModalOpen, setIsResetLeagueModalOpen] = useState(false);
  const [isEditPlayerModalOpen, setIsEditPlayerModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [preselectedChallenger, setPreselectedChallenger] = useState<Player | null>(null);
  const [preselectedChallenged, setPreselectedChallenged] = useState<Player | null>(null);
  const [selectedChallengeToResolve, setSelectedChallengeToResolve] = useState<Challenge | null>(null);
  const [selectedPlayerToEdit, setSelectedPlayerToEdit] = useState<Player | null>(null);

  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 5000);
  };
  
  const clearToast = () => setToastMessage(null);

  return (
    <UIContext.Provider
      value={{
        isNewChallengeModalOpen, setIsNewChallengeModalOpen,
        isMatchResultModalOpen, setIsMatchResultModalOpen,
        isPlayerModalOpen, setIsPlayerModalOpen,
        isRulesModalOpen, setIsRulesModalOpen,
        isResetLeagueModalOpen, setIsResetLeagueModalOpen,
        isEditPlayerModalOpen, setIsEditPlayerModalOpen,
        isLoginModalOpen, setIsLoginModalOpen,
        preselectedChallenger, setPreselectedChallenger,
        preselectedChallenged, setPreselectedChallenged,
        selectedChallengeToResolve, setSelectedChallengeToResolve,
        selectedPlayerToEdit, setSelectedPlayerToEdit,
        toastMessage, showToast, clearToast,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
