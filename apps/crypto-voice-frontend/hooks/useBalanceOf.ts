import { useEffect, useState } from 'react';
import { Contract } from 'ethers';
import { useSmartAccount } from './useSmartAccount';
import { ERC20_ABI } from '@biconomy/account';

export const useBalanceOf = (tokenAddress: `0x${string}`) => {
  const [balance, setBalance] = useState<bigint | null>(null);
  const { address, provider } = useSmartAccount();
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const contract = new Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await contract.balanceOf(address);
      setBalance(balance);
      setLoading(false);
    }
    catch(err) {
      setBalance(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tokenAddress || !address || !provider) return;
    fetchBalance();
  }, [tokenAddress, address, provider]);

  return { balance, loading };
};
