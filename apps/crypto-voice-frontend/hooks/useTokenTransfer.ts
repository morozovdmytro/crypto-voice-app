import { Contract } from 'ethers';
import { useSmartAccount } from './useSmartAccount';
import { PaymasterMode, Transaction } from '@biconomy/account';
import { useState } from 'react';
import { ERC20_ABI } from '@biconomy/account';

export type TokenTransferProps = {
  contractAddress: `0x${string}`;
  onStarted?: () => void;
  onSuccess?: (txHash?: string) => void;
  onError?: (error: Error) => void;
};

export const useTokenTransfer = ({
  contractAddress,
  onStarted,
  onSuccess,
  onError,
}: TokenTransferProps) => {
  const { smartAccount, signer } = useSmartAccount();
  const [isPending, setIsPending] = useState(false);

  const prepareTransaction = async (
    to: string,
    amount: bigint
  ): Promise<Transaction | null> => {
    if (!signer) return null;
    const contract = new Contract(contractAddress, ERC20_ABI, signer);
    return contract.transfer.populateTransaction(to, amount);
  };

  const transferToken = async (to: string, amount: bigint) => {
    try {
      if (!smartAccount || !signer) return;

      const contract = new Contract(contractAddress, ERC20_ABI, signer);
      const transferTransaction = await contract.transfer.populateTransaction(to, amount);

      setIsPending(true);
      onStarted?.();

      const userOpResponse = await smartAccount.sendTransaction(transferTransaction, {
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

  return { transferToken, isPending, prepareTransaction };
}; 