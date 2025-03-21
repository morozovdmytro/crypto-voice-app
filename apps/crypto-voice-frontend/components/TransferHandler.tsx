import React, { useState } from 'react';
import { useDataChannel, useRoomContext } from "@livekit/components-react";
import TransactionConfirmDialog from './TransactionConfirmDialog';
import { useTokenTransfer } from '@/hooks/useTokenTransfer';
import useTransactionHistory from '@/hooks/useTransactionHistory';
import { TokenDropData, TokenTransferData } from '@/types/transaction';

interface ExtendedTokenDropData extends TokenDropData {
  tokenName?: string;
}

const TransferHandler = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionData, setTransactionData] = useState<TokenTransferData | undefined>();
  const room = useRoomContext();
  const transactionHistory = useTransactionHistory();

  const { transferToken, isPending } = useTokenTransfer({
    contractAddress: transactionData?.contractAddress as `0x${string}`,
    onStarted: () => {
      console.log('Transfer transaction started');
    },
    onSuccess: (txHash) => {
      console.log('Transfer transaction successful:', txHash);
      setIsDialogOpen(false);
      if (transactionHistory && 'refetch' in transactionHistory) {
        transactionHistory.refetch();
      }
      if (room) {
        const responseData = {
          type: 'transfer_confirmation',
          status: 'success',
          txHash,
          contractAddress: transactionData?.contractAddress,
          amount: transactionData?.amount,
          message: 'Transfer successful',
        };
        
        try {
          const encodedData = new TextEncoder().encode(JSON.stringify(responseData));
          room.localParticipant.publishData(encodedData, { topic: 'transfer', reliable: true });
        } catch (error) {
          console.error('Error sending transfer confirmation:', error);
        }
      }
    },
    onError: (error) => {
      console.error('Transfer transaction error:', error);
      setIsDialogOpen(false);
      
      if (room) {
        const responseData = {
          type: 'transfer_confirmation',
          status: 'error',
          error: error.message,
          contractAddress: transactionData?.contractAddress,
          amount: transactionData?.amount,
          message: 'Transfer failed',
        };
        
        try {
          const encodedData = new TextEncoder().encode(JSON.stringify(responseData));
          room.localParticipant.publishData(encodedData, { topic: 'transfer', reliable: true });
        } catch (sendError) {
          console.error('Error sending transfer error:', sendError);
        }
      }
    }
  });

  const handleConfirm = () => {
    if (!transactionData) return;
    
    const amount = BigInt(transactionData.amount);
    transferToken(transactionData.to, amount);
  };

  const handleClose = () => {
    if (!isPending) {
      setIsDialogOpen(false);
      
      if (room && transactionData) {
        const responseData = {
          type: 'transfer_confirmation',
          status: 'declined',
          contractAddress: transactionData.contractAddress,
          amount: transactionData.amount,
          message: 'Transfer declined',
        };
        
        try {
          const encodedData = new TextEncoder().encode(JSON.stringify(responseData));
          room.localParticipant.publishData(encodedData, { topic: 'transfer', reliable: true });
        } catch (error) {
          console.error('Error sending transfer declined message:', error);
        }
      }
    }
  };

  useDataChannel("transfer", (msg) => {
    console.log("Transfer data received:", msg);
    try {
      const payload = new TextDecoder().decode(msg.payload);
      const data = JSON.parse(payload);
      
      if (data) {
        console.log("Token transfer data received:", data);
        const transferData = data.transferData ? JSON.parse(data.transferData) : data;
        
        setTransactionData({
          contractAddress: transferData.contractAddress,
          from: transferData.from,
          to: transferData.to,
          amount: transferData.amount,
          tokenName: data.tokenName || transferData.tokenName,
          decimals: data.decimals || transferData.decimals || 18
        });
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error parsing transfer data:", error);
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
          transactionData={{
            tokenAddress: transactionData.contractAddress,
            pricePerToken: "0",
            quantity: transactionData.amount,
            quantityLimitPerWallet: "0",
            currency: "0x0000000000000000000000000000000000000000",
            tokenName: transactionData.tokenName
          } as ExtendedTokenDropData}
        />
      )}
    </>
  );
};

export default TransferHandler;
