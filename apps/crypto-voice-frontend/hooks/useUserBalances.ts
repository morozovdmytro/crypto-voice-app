import { formatTokenAmount } from "@/lib/numbers.utils";
import { formatUnits } from "viem";
import { useBalanceOf } from "./useBalanceOf";
import { useNativeBalanceOf } from "./useNativeBalanceOf";
import useSmartContracts from "./useSmartContracts";
import { useTokenPrice } from "./useTokenPrice";
import { useState } from "react";

export const useUserBalances = () => {
  const { smartContract } = useSmartContracts();
  const { balance, loading: tokenLoading, fetchBalance: fetchTokenBalance } = useBalanceOf(smartContract.address as `0x${string}`);
  const { balance: nativeValance, loading: nativeLoading, fetchBalance: fetchNativeBalance } = useNativeBalanceOf();
  const prices = useTokenPrice();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cryptoBalances = [
    {
      id: smartContract.address,
      icon: smartContract.image,
      name: smartContract.name,
      symbol: smartContract.ticker,
      amount: formatTokenAmount(balance || 0n, smartContract.decimals),
      value:
        parseFloat(formatUnits(balance || 0n, smartContract.decimals)) *
        prices[smartContract.ticker],
    },
    {
      id: "native",
      icon: "/polygon.png",
      name: "POL",
      symbol: "POL",
      amount: formatTokenAmount(nativeValance || 0n, 18),
      value: parseFloat(formatUnits(nativeValance || 0n, 18)) * prices["POL"],
    },
  ];

  const totalValue = cryptoBalances.reduce((acc, curr) => {
    return acc + curr.value;
  }, 0);

  const refreshBalances = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchTokenBalance(),
      fetchNativeBalance()
    ]);
    setIsRefreshing(false);
  };

  return { 
    totalValue, 
    cryptoBalances, 
    isRefreshing: isRefreshing || tokenLoading || nativeLoading,
    refreshBalances 
  };
};
