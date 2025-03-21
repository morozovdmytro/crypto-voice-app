import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { TokenDropData } from '@/types/transaction';
import { formatUnits } from 'viem';

interface TransactionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
  onConfirm: () => void;
  transactionData?: TokenDropData;
}

const TransactionConfirmDialog: React.FC<TransactionConfirmDialogProps> = ({
  isOpen,
  onClose,
  isPending,
  onConfirm,
  transactionData,
}) => {
  if (!transactionData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {isPending ? (
          <>
            <DialogHeader>
              <DialogTitle>Processing Transaction</DialogTitle>
              <DialogDescription>
                Please wait while your transaction is being processed.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <DialogFooter>
              <DialogDescription className="text-xs text-center w-full">
                Your transaction is being confirmed on the blockchain. 
                This process can take a moment, please don&apos;t close this window.
              </DialogDescription>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Transaction</DialogTitle>
              <DialogDescription>
                You are about to claim tokens from a token drop.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="font-medium">Token Amount:</div>
                <div className="text-right">{formatUnits(BigInt(transactionData.quantity), 18)}</div>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="font-medium">Price per Token:</div>
                <div className="text-right">{formatUnits(BigInt(transactionData.pricePerToken), 18)}</div>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="font-medium">Contract Address:</div>
                <div className="text-right truncate text-xs">
                  {transactionData.tokenAddress}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onConfirm}>
                Confirm
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionConfirmDialog; 