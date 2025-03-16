import { env } from "@/env";
import {
    CHAIN_NAMESPACES,
    WEB3AUTH_NETWORK_TYPE,
} from '@web3auth/base';
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { AuthAdapter } from "@web3auth/auth-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { useEffect, useState } from "react";

const network = env.NEXT_PUBLIC_WEB3AUTH_NETWORK;
const clientId = env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
const verifier = env.NEXT_PUBLIC_WEB3AUTH_VERIFIER;
const googleClientId = env.NEXT_PUBLIC_WEB3AUTH_GOOGLE_CLIENT_ID;

export type AuthStatus = 'initializing' | 'ready' | 'connected' | 'error';

export const useWeb3Auth = () => {
    const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
    const [status, setStatus] = useState<AuthStatus>('initializing');
    const [error, setError] = useState<Error | null>(null);
    
    useEffect(() => {
        const initializeWeb3Auth = async () => {
            try {
                if (!clientId || !verifier || !googleClientId) {
                    throw new Error("Missing required environment variables");
                }
                
                const chain = (await import('@/lib/wagmi/chains')).CHAINS[0];
                
                const chainConfig = {
                    chainNamespace: CHAIN_NAMESPACES.EIP155,
                    chainId: '0x' + chain.id.toString(16),
                    rpcTarget: chain.rpcUrls.default.http[0],
                    displayName: chain.name,
                    tickerName: chain.nativeCurrency?.name,
                    ticker: chain.nativeCurrency?.symbol,
                    blockExplorer: chain.blockExplorers?.default.url[0]!,
                };

                const privateKeyProvider = new EthereumPrivateKeyProvider({
                    config: { chainConfig },
                });

                const web3authInstance = new Web3AuthNoModal({
                    clientId,
                    web3AuthNetwork: network as WEB3AUTH_NETWORK_TYPE,
                    chainConfig,
                    privateKeyProvider,
                });

                const authAdapter = new AuthAdapter();
                web3authInstance.configureAdapter(authAdapter);
                
                await web3authInstance.init();
                
                setWeb3auth(web3authInstance);
                setStatus(web3authInstance.connected ? 'connected' : 'ready');
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setStatus('error');
                console.error("Failed to initialize Web3Auth:", error);
            }
        };

        initializeWeb3Auth();
    }, []);

    const login = async () => {
        try {
            if (!web3auth) {
                throw new Error("Web3Auth not initialized");
            }
            
            setStatus('initializing');
            
            await web3auth.connectTo("auth", {
                loginProvider: "google",
            });
            
            setStatus('connected');
            return web3auth;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setStatus('error');
            console.error("Failed to login:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (!web3auth) {
                return;
            }
            
            await web3auth.logout();
            setStatus('ready');
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error("Failed to logout:", error);
        }
    };

    return {
        web3auth,
        login,
        logout,
        status,
        error,
        isInitializing: status === 'initializing',
        isConnected: status === 'connected',
        isReady: status === 'ready',
        isError: status === 'error',
    };
};