'use client';

import BalanceCard from "@/components/BalanceCard";
import { CardContent } from "@/components/ui/card";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Wallet } from "lucide-react";
import TransactionHistory from "@/components/TransactionHistory";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { useWeb3Auth } from "@/hooks/useWeb3Auth";
import { useRouter } from "next/navigation";
import { useUserData } from "@/hooks/useUserData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Spinner from "@/components/ui/spinner";
import { useDisplayAddress } from "@/hooks/useDisplayAddress";
import { CHAINS } from "@/lib/wagmi/chains";
import { useExplorerLink } from "@/hooks/useExplorerLink";

const Dashboard = () => {
    const { address, isReady: isSmartAccountReady } = useSmartAccount();
    const { userData, isReady: isUserDataReady } = useUserData();
    const router = useRouter();
    const { logout } = useWeb3Auth();

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    const displayAddress = useDisplayAddress(address);
    const explorerLink = useExplorerLink(address, CHAINS[0].id, 'address');

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-accent-main">Dashboard</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:space-x-2">
                        {isUserDataReady && userData && (
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                <AvatarImage src={userData.picture} />
                                <AvatarFallback>
                                    {userData.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        {isSmartAccountReady && address ? (
                            <Button variant="outline" 
                                className="text-xs sm:text-sm"
                                onClick={() => explorerLink && window.open(explorerLink, '_blank')}>
                                <Wallet className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                {displayAddress}
                            </Button>
                        ) : (
                            <Button disabled className="text-xs sm:text-sm">
                                <Wallet className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <Spinner className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                        )}
                        <Button onClick={handleLogout} 
                            className="bg-secondary hover:bg-secondary/80 text-xs sm:text-sm">
                            <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-4 w-full">
                        <BalanceCard />
                        <Card className="bg-mid shadow-xl w-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base sm:text-lg md:text-xl">Recent Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TransactionHistory />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="w-full">
                        <Card className="h-full bg-mid shadow-xl w-full">
                            <CardContent className="p-3 sm:p-6">
                                <VoiceAssistant />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;