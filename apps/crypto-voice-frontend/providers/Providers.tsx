'use client';

import { QueryProvider } from "./QueryProvider";
import { GeneralStoreProvider } from "./GeneralStoreProvider";
import { Web3AuthProvider } from "./Web3AuthProvider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (<QueryProvider>
        <GeneralStoreProvider>
            <Web3AuthProvider>
                {children}
            </Web3AuthProvider>
        </GeneralStoreProvider>
    </QueryProvider>);
};