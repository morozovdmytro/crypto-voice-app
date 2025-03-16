import { useEffect } from "react";
import * as chains from 'viem/chains';

import { useState } from "react";

export const useExplorerLink = (address?: string | null, chainId?: number, type?: 'address' | 'tx' | 'token') => {
    const [explorerLink, setExplorerLink] = useState<string | null>(null);

    const generateExplorerLink = (address: string, chainId: number, type: 'address' | 'tx' | 'token') => {
        const chainDefinitions = Object.values(chains) as chains.Chain[];
        const currentChain = chainDefinitions.find((chain) => chain.id === chainId);
        const blockExplorerUrl =
            currentChain?.blockExplorers?.default.url ?? 'https://etherscan.io';

        return `${blockExplorerUrl}/${type}/${address}`;
    }

    useEffect(() => {
        if (address && chainId && type) {
            setExplorerLink(generateExplorerLink(address, chainId, type));
        }
    }, [address, chainId, type]);

    return explorerLink;
}