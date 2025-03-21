"use client"

import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import useTransactionHistory from "@/hooks/useTransactionHistory"
import { useSmartAccount } from "@/hooks/useSmartAccount"
import Spinner from "@/components/ui/spinner"
import useSmartContracts from "@/hooks/useSmartContracts"
import { formatTokenAmount } from "@/lib/numbers.utils"
import { Button } from "@/components/ui/button"

const TransactionHistory = () => {
  const { address } = useSmartAccount();
  const { smartContract } = useSmartContracts();
  const { data: transactions, isLoading, error, refetch, isRefetching } = useTransactionHistory(address, smartContract.address);

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

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px] sm:h-[250px] md:h-[350px]">
        <Spinner color="main" size="large"/>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[200px] sm:h-[250px] md:h-[350px]">
        <p className="text-sm sm:text-base">Error loading transaction history</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleRefresh} 
          disabled={isLoading || isRefetching}
          className="h-8 px-2"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <ScrollArea className="h-[200px] sm:h-[250px] md:h-[350px] pr-2 sm:pr-4 w-full">
        <div className="space-y-3 sm:space-y-4">
          {!transactions || transactions.length === 0 ? (
            <div className="flex items-center justify-center h-[150px] sm:h-[200px] md:h-[250px] text-muted-foreground">
              <p className="text-sm sm:text-base">No transactions found</p>
            </div>
          ) : (
            transactions?.map((transaction) => (
              <div key={transaction.transactionIndex} className="flex items-center justify-between border-b pb-3 sm:pb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div
                    className={`flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full ${transaction.to.toLocaleLowerCase() === address?.toLocaleLowerCase() ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}
                  >
                    {transaction.to === address ? (
                      <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm md:text-base font-medium">
                      {transaction.to.toLocaleLowerCase() === address?.toLocaleLowerCase() ? "Bought" : "Sold"} {transaction.tokenName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTokenAmount(transaction.value, parseInt(transaction.tokenDecimal))} {transaction.tokenSymbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm md:text-base font-medium">
                    ${formatTokenAmount(transaction.value, parseInt(transaction.tokenDecimal))}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(transaction.timeStamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default TransactionHistory;
