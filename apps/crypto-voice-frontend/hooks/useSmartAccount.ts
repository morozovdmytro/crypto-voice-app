import {
  createSmartAccountClient,
  BiconomySmartAccountV2,
} from '@biconomy/account';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { env } from '@/env';
import { WalletLoginError } from '@web3auth/base';

export const useSmartAccount = () => {
  const web3authInstance = useWeb3AuthInstance();
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  
  const createSmartAccount = async (web3auth: Web3AuthNoModal) => {
    try{ 
      if (!env.NEXT_PUBLIC_BICONOMY_API_KEY || !env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL)
        return;
      
      const wallet = await web3auth.getUserInfo();
      
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

      const address = await smartWallet.getAccountAddress();
      setAddress(address);
      setSmartAccount(smartWallet);
    } catch (error) {
      //TODO: handle error
    }
  };

  useEffect(() => {
    if (!web3authInstance?.provider) return;
    createSmartAccount(web3authInstance);
  }, [web3authInstance]);

  return { smartAccount, provider, signer, address };
};
