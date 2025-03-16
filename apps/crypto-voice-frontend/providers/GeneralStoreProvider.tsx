'use client';

import { GeneralStoreContext } from '@/lib/store/general';
import { GeneralStore } from '@/lib/store/general';
import { createGeneralStore } from '@/lib/store/general';
import { useRef } from 'react';

export const GeneralStoreProvider = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config?: Partial<GeneralStore>;
}) => {
  const store = useRef(createGeneralStore(config)).current;

  return (
    <GeneralStoreContext.Provider value={store}>{children}</GeneralStoreContext.Provider>
  );
};
