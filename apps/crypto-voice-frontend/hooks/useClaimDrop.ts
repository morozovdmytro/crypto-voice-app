import { Contract, ZeroHash } from 'ethers';
import { useSmartAccount } from './useSmartAccount';
import { PaymasterMode, Transaction } from '@biconomy/account';
import { useState } from 'react';
import { ClaimDropAbi } from '@/types/abi';

export type ClaimDropProps = {
  tokenAddress: `0x${string}`;
  tokenPrice: bigint;
  quantityLimitPerWallet: bigint;
  currency: `0x${string}`;
  onStarted?: () => void;
  onSuccess?: (txHash?: string) => void;
  onError?: (error: Error) => void;
};

export const useClaimDrop = ({
  tokenAddress,
  tokenPrice,
  quantityLimitPerWallet,
  currency,
  onStarted,
  onSuccess,
  onError,
}: ClaimDropProps) => {
  const { smartAccount, signer, address } = useSmartAccount();
  const [isPending, setIsPending] = useState(false);

  const prepareTxArguments = (tokenAmount: bigint) => {
    const quantity = tokenAmount;
    const txTokenPrice = tokenPrice;
    const txQuantityLimitPerWallet = quantityLimitPerWallet;
    const allowlistProof = {
      proof: [],
      quantityLimitPerWallet: txQuantityLimitPerWallet,
      pricePerToken: txTokenPrice,
      currency: currency as `0x${string}`,
    };
    return { quantity, txTokenPrice, allowlistProof, txQuantityLimitPerWallet };
  };

  const prepareTransaction = async (amount: bigint): Promise<Transaction | null> => {
    if (!signer) return null;
    const contract = new Contract(tokenAddress, ClaimDropAbi, signer);
    const { quantity, txTokenPrice, allowlistProof } = prepareTxArguments(amount);
    return contract.claim.populateTransaction(address, quantity, currency, txTokenPrice, allowlistProof, ZeroHash);
  };

  const claimDrop = async (amount: bigint) => {
    try {
      if (!smartAccount || !signer) return;

      const contract = new Contract(tokenAddress, ClaimDropAbi, signer);

      const { quantity, txTokenPrice, allowlistProof } = prepareTxArguments(amount);
      const claimTransaction = await contract.claim.populateTransaction(address, quantity, currency, txTokenPrice, allowlistProof, ZeroHash);

      setIsPending(true);
      onStarted?.();

      const userOpResponse = await smartAccount.sendTransaction(claimTransaction, {
        paymasterServiceData: { 
          mode: PaymasterMode.SPONSORED
        },
      });
      const { transactionHash } = await userOpResponse.waitForTxHash();
      console.log('Transaction Hash:', transactionHash);
      await userOpResponse.wait();
      setIsPending(false);
      onSuccess?.(transactionHash);
    } catch (err) {
      setIsPending(false);
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
    }
  };

  return { claimDrop, isPending, prepareTransaction };
}; 