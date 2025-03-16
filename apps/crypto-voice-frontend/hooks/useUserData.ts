import { useEffect, useState } from "react";
import { useWeb3Auth } from "./useWeb3Auth"

export type UserData = {
    name: string;
    email: string;
    picture: string;
};

export type UserDataStatus = 'idle' | 'loading' | 'ready' | 'error';

export const useUserData = () => {
    const { web3auth, isConnected } = useWeb3Auth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [status, setStatus] = useState<UserDataStatus>('idle');
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!web3auth || !isConnected) {
                return;
            }

            try {
                setStatus('loading');
                const user = await web3auth.getUserInfo();
                
                if (user) {
                    setUserData({
                        name: user.name || "",
                        email: user.email || "",
                        picture: user.profileImage || "",
                    });
                    setStatus('ready');
                } else {
                    throw new Error("Failed to get user info");
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setStatus('error');
                console.error("Failed to get user data:", error);
            }
        };

        fetchUserData();
    }, [web3auth, isConnected]);

    // Reset state when web3auth is disconnected
    useEffect(() => {
        if (!isConnected) {
            setUserData(null);
            setStatus('idle');
        }
    }, [isConnected]);

    return { 
        userData, 
        status,
        isLoading: status === 'loading',
        isReady: status === 'ready',
        isError: status === 'error'
    };
};