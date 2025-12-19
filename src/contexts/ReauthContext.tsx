// llf-webview/src/contexts/ReauthContext.tsx

import { createContext, useContext, useState, type FC, type ReactNode } from "react";

interface ReauthContextType {
  showReauthModal: () => void;
  hideReauthModal: () => void;
  isReauthModalOpen: boolean;
  onReauthSuccess: ((token: string) => void) | null;
  setOnReauthSuccess: (callback: (token: string) => void) => void;
}

const ReauthContext = createContext<ReauthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useReauth = () => {
  const context = useContext(ReauthContext);
  if (!context) {
    throw new Error("useReauth must be used within ReauthProvider");
  }
  return context;
};

interface ReauthProviderProps {
  children: ReactNode;
}

export const ReauthProvider: FC<ReauthProviderProps> = ({ children }) => {
  const [isReauthModalOpen, setIsReauthModalOpen] = useState(false);
  const [onReauthSuccess, setOnReauthSuccess] = useState<((token: string) => void) | null>(null);

  const showReauthModal = () => {
    setIsReauthModalOpen(true);
  };

  const hideReauthModal = () => {
    setIsReauthModalOpen(false);
  };

  return (
    <ReauthContext.Provider
      value={{
        showReauthModal,
        hideReauthModal,
        isReauthModalOpen,
        onReauthSuccess,
        setOnReauthSuccess,
      }}
    >
      {children}
    </ReauthContext.Provider>
  );
};
