'use client';

import { useGeneralStore } from '@/lib/store/general';
import React, { createContext, useContext, useEffect } from 'react';

interface Web3AuthContextValue {
  web3AuthInstance: any;
}

const Web3AuthContext = createContext<Web3AuthContextValue | undefined>(undefined);

export const Web3AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 /*  const { web3AuthInstance } = useWeb3AuthInitInstance();
  const { address } = useSmartAccount();
  const userId = useGeneralStore((s) => s.investor?.id); */

  return (
    <Web3AuthContext.Provider value={{ web3AuthInstance: null }}>
      {children}
    </Web3AuthContext.Provider>
  );
};

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (context === undefined) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider');
  }
  return context;
};
