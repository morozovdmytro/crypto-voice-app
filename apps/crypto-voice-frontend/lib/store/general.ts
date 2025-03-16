'use client';

import { createContext, useContext } from 'react';
import { createStore, useStore } from 'zustand';

export interface GeneralStore {

}

export const createGeneralStore = (initProps?: Partial<GeneralStore>) => {
  return createStore<GeneralStore>(set => ({
    
  }));
};

type GeneralStoreApi = ReturnType<typeof createGeneralStore>;
export const GeneralStoreContext = createContext<GeneralStoreApi | null>(null);

export const useGeneralStore = <T = GeneralStore>(
  selector: (state: GeneralStore) => T = state => state as T,
): T => {
  const generalStore = useContext(GeneralStoreContext);
  if (!generalStore) throw new Error('Missing GeneralProvider in the tree');

  return useStore(generalStore, selector);
};

export const useStablecoins = () => {
  return [
    {
      name: 'USDC',
      key: 'USDC',
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      icon: '/images/usdc.png',
      disabled: false,
      exchangeCurrency: 'USD',
    },
    {
      name: 'USDT',
      key: 'USDT',
      address: '',
      icon: '/images/usdt.png',
      disabled: true,
      exchangeCurrency: 'USD',
    },
  ];
};