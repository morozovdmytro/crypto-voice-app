import { useState } from 'react';
import { PaymasterMode, Transaction } from '@biconomy/account';
import { useGeneralStore } from '@/lib/store/general';
import { useSmartAccount } from './useSmartAccount';

export type BatchTransactionProps = {
  onStarted?: () => void;
  onSuccess?: ((txHash?: string) => void) | ((txHash?: string) => Promise<void>);
  onError?: (error: any) => void;
};

export const useBatchTransactions = ({
  onStarted,
  onSuccess,
  onError,
}: BatchTransactionProps) => {
  const { smartAccount, signer, address } = useSmartAccount();
  const [isPending, setIsPending] = useState(false);

  const execute = async (txs: Transaction[], action?: string) => {
    try {
      if (!smartAccount || !signer) return;

      setIsPending(true);
      onStarted?.();

      const userOpResponse = await smartAccount?.sendTransaction(txs, {
        paymasterServiceData: {
          mode: PaymasterMode.SPONSORED
        },
      });
      const { transactionHash } = await userOpResponse.waitForTxHash();
      await userOpResponse.wait();
      setIsPending(false);
      onSuccess?.(transactionHash);
    } catch (err) {
      setIsPending(false);
      onError?.(err);
    }
  };

  return { execute, isPending };
};
