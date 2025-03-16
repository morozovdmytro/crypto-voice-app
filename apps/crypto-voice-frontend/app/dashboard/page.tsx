'use client';

import BalanceCard from "@/components/BalanceCard";
import { CardContent, CardFooter } from "@/components/ui/card";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, LogOut, Wallet } from "lucide-react";
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
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <div className="flex items-center space-x-2">
                        {isUserDataReady && userData && (
                            <Avatar>
                                <AvatarImage src={userData.picture} />
                                <AvatarFallback>
                                    {userData.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        {isSmartAccountReady && address ? (
                            <Button variant="outline" onClick={() => explorerLink && window.open(explorerLink, '_blank')}>
                                <Wallet className="mr-2 h-4 w-4" />
                                {displayAddress}
                            </Button>
                        ) : (
                            <Button disabled>
                                <Wallet className="mr-2 h-4 w-4" />
                                <Spinner className="h-4 w-4" />
                            </Button>
                        )}
                        <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-4">
                        <BalanceCard />

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle>Recent Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TransactionHistory />
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card className="h-full">
                            <CardContent>
                                <VoiceAssistant />
                            </CardContent>
                            <CardFooter className="border-t pt-4">
                                <p className="text-xs text-muted-foreground">
                                    Try saying: "Show me my Bitcoin balance" or "What's the trend for Ethereum?"
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;