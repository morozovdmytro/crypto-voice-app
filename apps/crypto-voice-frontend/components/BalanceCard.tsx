"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useBalanceOf } from "@/hooks/useBalanceOf"
import { useSmartContracts } from "@/hooks/useSmartContracts"
import { formatTokenAmount } from "@/lib/numbers.utils"

const BalanceCard = () => {
  const { smartContract } = useSmartContracts();
  const { balance } = useBalanceOf(smartContract.address as `0x${string}`);

  const totalValue = balance ? formatTokenAmount(balance, smartContract.decimals) : 0;

  const cryptoBalances = [
    {
      id: smartContract.address,
      icon: smartContract.image,
      name: smartContract.name,
      symbol: smartContract.ticker,
      amount: formatTokenAmount(balance || 0n, smartContract.decimals),
      value: totalValue,
      change: 0,
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Total Balance</CardTitle>
        <CardDescription>Your crypto portfolio value</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-4 space-y-2">
          {cryptoBalances.map((crypto) => (
            <div key={crypto.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 bg-primary/10">
                  <AvatarImage src={crypto.icon} />
                  <AvatarFallback>
                    <div className="text-sm font-medium">{crypto.symbol}</div>
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{crypto.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {crypto.amount} {crypto.symbol}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  ${crypto.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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