import { useQuery } from "@tanstack/react-query";
import { internalApi } from "@/services/internal";

const useTransactionHistory = (address?: string | null, contractAddress?: string | null) => {
    return useQuery({
        queryKey: ['transactionHistory', address, contractAddress],
        queryFn: () => internalApi.getTransactionHistory(address!, contractAddress!),
        enabled: !!address && !!contractAddress,
    });
}

export default useTransactionHistory;
