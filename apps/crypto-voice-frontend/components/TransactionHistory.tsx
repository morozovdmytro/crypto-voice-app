"use client"

import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import useTransactionHistory from "@/hooks/useTransactionHistory"
import { useSmartAccount } from "@/hooks/useSmartAccount"
import Spinner from "@/components/ui/spinner"
import useSmartContracts from "@/hooks/useSmartContracts"
import { formatTokenAmount } from "@/lib/numbers.utils"

const TransactionHistory = () => {
  const { address } = useSmartAccount();
  const { smartContract } = useSmartContracts();
  const { data: transactions, isLoading, error, refetch } = useTransactionHistory(address, smartContract.address);

  const formatDate = (timestamp: string) => {
    const timestampMs = timestamp.length === 10 
      ? parseInt(timestamp) * 1000
      : parseInt(timestamp);
      
    const date = new Date(timestampMs);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Error loading transaction history</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[350px] pr-4">
      <div className="space-y-4">
        {!transactions || transactions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No transactions found</p>
          </div>
        ) : (
          transactions?.map((transaction) => (
            <div key={transaction.transactionIndex} className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${transaction.to.toLocaleLowerCase() === address?.toLocaleLowerCase() ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    }`}
                >
                  {transaction.to === address ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {transaction.to.toLocaleLowerCase() === address?.toLocaleLowerCase() ? "Bought" : "Sold"} {transaction.tokenName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTokenAmount(transaction.value, parseInt(transaction.tokenDecimal))} {transaction.tokenSymbol}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  ${formatTokenAmount(transaction.value, parseInt(transaction.tokenDecimal))}
                </div>
                <div className="text-xs text-muted-foreground">{formatDate(transaction.timeStamp)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}

export default TransactionHistory;
