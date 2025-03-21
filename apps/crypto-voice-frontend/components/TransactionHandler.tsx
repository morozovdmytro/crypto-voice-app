import React, { useState } from 'react';
import { useDataChannel, useRoomContext } from "@livekit/components-react";
import TransactionConfirmDialog from './TransactionConfirmDialog';
import { useClaimDrop } from '@/hooks/useClaimDrop';
import useTransactionHistory from '@/hooks/useTransactionHistory';
import { TokenDropData } from '@/types/transaction';
import { formatUnits } from 'viem';

const TransactionHandler = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionData, setTransactionData] = useState<TokenDropData | undefined>();
  const room = useRoomContext();
  const transactionHistory = useTransactionHistory();

  const { claimDrop, isPending } = useClaimDrop({
    tokenAddress: transactionData?.tokenAddress as `0x${string}`,
    tokenPrice: BigInt(transactionData?.pricePerToken || 0),
    quantityLimitPerWallet: BigInt(transactionData?.quantityLimitPerWallet || 0),
    currency: transactionData?.currency as `0x${string}`,
    onStarted: () => {
      console.log('Transaction started');
    },
    onSuccess: (txHash) => {
      console.log('Transaction successful:', txHash);
      setIsDialogOpen(false);
      if (transactionHistory && 'refetch' in transactionHistory) {
        transactionHistory.refetch();
      }
      if (room) {
        const responseData = {
          type: 'transaction_confirmation',
          status: 'success',
          txHash,
          tokenAddress: transactionData?.tokenAddress,
          amount: formatUnits(BigInt(transactionData?.quantity || 0), 18),
          message: 'Transaction successful',
        };

        try {
          const encodedData = new TextEncoder().encode(JSON.stringify(responseData));
          room.localParticipant.publishData(encodedData, { topic: 'transaction', reliable: true });
        } catch (error) {
          console.error('Error sending transaction confirmation:', error);
        }
      }
    },
    onError: (error) => {
      console.error('Transaction error:', error);
      setIsDialogOpen(false);
      
      if (room) {
        const responseData = {
          type: 'transaction_confirmation',
          status: 'error',
          error: error.message,
          tokenAddress: transactionData?.tokenAddress,
          amount: formatUnits(BigInt(transactionData?.quantity || 0), 18),
          message: 'Transaction failed',
        };
        
        try {
          const encodedData = new TextEncoder().encode(JSON.stringify(responseData));
          room.localParticipant.publishData(encodedData, { topic: 'transaction', reliable: true });
        } catch (sendError) {
          console.error('Error sending transaction error:', sendError);
        }
      }
    }
  });

  const handleConfirm = () => {
    if (!transactionData) return;
    
    claimDrop(BigInt(transactionData.quantity));
  };

  const handleClose = () => {
    if (!isPending) {
      setIsDialogOpen(false);
      
      if (room && transactionData) {
        const responseData = {
          type: 'transaction_confirmation',
          status: 'declined',
          tokenAddress: transactionData.tokenAddress,
          amount: formatUnits(BigInt(transactionData.quantity || 0), 18),
          message: 'Transaction declined',
        };
        
        try {
          const encodedData = new TextEncoder().encode(JSON.stringify(responseData));
          room.localParticipant.publishData(encodedData, { topic: 'transaction', reliable: true });
        } catch (error) {
          console.error('Error sending transaction declined message:', error);
        }
      }
    }
  };

  useDataChannel("transaction", (msg) => {
    console.log("Transaction data received:", msg);
    try {
      const payload = new TextDecoder().decode(msg.payload);
      const data = JSON.parse(payload);
      
      if (data) {
        console.log("Token drop claim data received:", data);
        setTransactionData({
          tokenAddress: data.tokenAddress,
          pricePerToken: data.pricePerToken,
          quantity: data.quantity,
          quantityLimitPerWallet: data.quantityLimitPerWallet,
          currency: data.currency
        });
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error parsing transaction data:", error);
    }
  });

  return (
    <>
      {transactionData && (
        <TransactionConfirmDialog
          isOpen={isDialogOpen}
          onClose={handleClose}
          isPending={isPending}
          onConfirm={handleConfirm}
          transactionData={transactionData}
        />
      )}
    </>
  );
};

export default TransactionHandler;
