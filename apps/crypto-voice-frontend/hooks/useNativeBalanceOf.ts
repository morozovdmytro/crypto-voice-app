import { useState, useEffect } from 'react'
import { useSmartAccount } from './useSmartAccount';

export const useNativeBalanceOf = () => {
    const [balance, setBalance] = useState<bigint | null>(null);
    const { address, provider } = useSmartAccount();
    const [loading, setLoading] = useState(false);

    const fetchBalance = async () => {
        setLoading(true);
        try {
            const balance = await provider!.getBalance(address!);
            setBalance(balance);
            setLoading(false);
        }
        catch (err) {
            console.error("Error fetching native balance:", err);
            setBalance(null);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!address || !provider) return;
        fetchBalance();
    }, [address, provider]);

    return { balance, loading, fetchBalance };

}