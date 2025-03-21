"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserBalances } from "@/hooks/useUserBalances";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

const BalanceCard = () => {
  const { totalValue, cryptoBalances, isRefreshing, refreshBalances } = useUserBalances();

  return (
    <Card className="bg-mid shadow-xl w-full">
      <CardHeader className="pb-2 sm:pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg sm:text-xl md:text-2xl">Total Balance</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your crypto portfolio value</CardDescription>
        </div>
        <Button 
          variant="ghost"
          size="icon" 
          onClick={refreshBalances} 
          disabled={isRefreshing}
          className="h-8 w-8"
        >
          <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh balances</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-bold">
          ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
          {cryptoBalances.map((crypto) => (
            <div key={crypto.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 bg-primary/10">
                  <AvatarImage src={crypto.icon} />
                  <AvatarFallback>
                    <div className="text-xs sm:text-sm font-medium">{crypto.symbol}</div>
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm sm:text-base font-medium">{crypto.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {crypto.amount} {crypto.symbol}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm sm:text-base font-medium">
                  ${crypto.value.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default BalanceCard;