import {
  createSmartAccountClient,
  BiconomySmartAccountV2,
} from '@biconomy/account';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { env } from '@/env';
import { useWeb3Auth } from './useWeb3Auth';

export type SmartAccountStatus = 'idle' | 'loading' | 'ready' | 'error';

export const useSmartAccount = () => {
  const { web3auth, isConnected } = useWeb3Auth();
  const [status, setStatus] = useState<SmartAccountStatus>('idle');
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initSmartAccount = async () => {
      if (!web3auth || !isConnected || !env.NEXT_PUBLIC_BICONOMY_API_KEY || !env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL) {
        return;
      }

      try {
        setStatus('loading');
        
        const ethersProvider = new ethers.BrowserProvider(web3auth.provider!);
        setProvider(ethersProvider);

        const signer = await ethersProvider.getSigner();
        setSigner(signer);

        const smartWallet = await createSmartAccountClient({
          signer,
          biconomyPaymasterApiKey: env.NEXT_PUBLIC_BICONOMY_API_KEY,
          bundlerUrl: env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL,
          rpcUrl: "",
        });

        const walletAddress = await smartWallet.getAccountAddress();
        setAddress(walletAddress);
        setSmartAccount(smartWallet);
        setStatus('ready');
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setStatus('error');
        console.error("Failed to initialize smart account:", error);
      }
    };

    initSmartAccount();
  }, [web3auth, isConnected]);

  useEffect(() => {
    if (!isConnected) {
      setSmartAccount(null);
      setProvider(null);
      setSigner(null);
      setAddress(null);
      setStatus('idle');
    }
  }, [isConnected]);

  return { 
    smartAccount, 
    provider, 
    signer, 
    address, 
    status,
    isLoading: status === 'loading',
    isReady: status === 'ready',
    isError: status === 'error'
  };
};
