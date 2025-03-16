import { env } from "@/env";
import {
    CHAIN_NAMESPACES,
    WEB3AUTH_NETWORK_TYPE,
} from '@web3auth/base';
import { Chain } from 'viem';
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { AuthAdapter } from "@web3auth/auth-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { useEffect, useMemo, useRef, useState } from "react";

const network = env.NEXT_PUBLIC_WEB3AUTH_NETWORK;
const clientId = env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
const verifier = env.NEXT_PUBLIC_WEB3AUTH_VERIFIER;
const googleClientId = env.NEXT_PUBLIC_WEB3AUTH_GOOGLE_CLIENT_ID;

export const useWeb3Auth = ({ chain }: { chain: Chain }) => {
    const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const web3authRef = useRef<Web3AuthNoModal | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const chainConfig = useMemo(() => ({
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: '0x' + chain.id.toString(16),
        rpcTarget: chain.rpcUrls.default.http[0],
        displayName: chain.name,
        tickerName: chain.nativeCurrency?.name,
        ticker: chain.nativeCurrency?.symbol,
        blockExplorer: chain.blockExplorers?.default.url[0]!,
    }), [chain]);

    useEffect(() => {
        return () => {
            if (web3authRef.current) {
                web3authRef.current = null;
            }
        };
    }, []);

    const initialize = async () => {
        try {
            setIsInitializing(true);
            setError(null);
            
            if (!clientId || !verifier || !googleClientId) {
                throw new Error("Missing required environment variables");
            }
            
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

            web3authRef.current = web3authInstance;
            setWeb3auth(web3authInstance);

            setIsConnected(web3authInstance.connected);
            
            return web3authInstance;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            throw error;
        } finally {
            setIsInitializing(false);
        }
    }

    const login = async () => {
        try {
            setIsLoggingIn(true);
            setError(null);
            
            const instance = web3authRef.current || web3auth;
            
            if (!instance) {
                throw new Error("Web3Auth not initialized");
            }

            await instance.connectTo("auth", {
                loginProvider: "google",
            });

            setIsConnected(instance.connected);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            throw error;
        } finally {
            setIsLoggingIn(false);
        }
    }

    const logout = async () => {
        try {
            setError(null);
            
            const instance = web3authRef.current || web3auth;
            
            if (!instance) {
                throw new Error("Web3Auth not initialized");
            }

            await instance.logout();
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            throw error;
        }
    }

    return {
        web3auth: web3authRef.current || web3auth,
        initialize,
        login,
        logout,
        isInitializing,
        isLoggingIn,
        error,
        isConnected,
    }
}