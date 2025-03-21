'use client';

import Spinner from "@/components/ui/spinner";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { useWeb3Auth } from "@/hooks/useWeb3Auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { status: authStatus, isConnected } = useWeb3Auth();
    const { status: smartAccountStatus } = useSmartAccount();
    const router = useRouter();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (authStatus !== 'initializing' && !isConnected) {
                router.push("/");
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [authStatus, isConnected, router]);

    const isLoading = 
        authStatus === 'initializing' || 
        (isConnected && smartAccountStatus === 'loading');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner color="main" size="large"/>
            </div>
        );
    }

    return children;
}