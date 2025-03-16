'use client';

import { AgentState, LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { MediaDeviceFailure } from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import VoiceAssistantBars from "@/components/VoiceAssistantBars";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import ControlBar from "@/components/ControlBar";
import { useUserData } from "@/hooks/useUserData";
import Spinner from "./ui/spinner";
import useSmartContracts from "@/hooks/useSmartContracts";
import { useBalanceOf } from "@/hooks/useBalanceOf";
import { formatTokenAmount } from "@/lib/numbers.utils";
import { useRoomCreation } from "@/hooks/useRoomCreation";
import { Room as RoomType } from "../types/room";

const VoiceAssistant = ({ userId }: { userId: string }) => {
    const [connectionDetails, setConnectionDetails] = useState<RoomType | undefined>();
    const [agentState, setAgentState] = useState<AgentState>("disconnected");
    const { userData, status } = useUserData();
    const { smartContract } = useSmartContracts();
    const { balance, loading: isBalanceLoading } = useBalanceOf(smartContract.address as `0x${string}`);

    const userInfo = {
        name: userData?.name,
        balance: balance ? `${formatTokenAmount(balance)} ${smartContract.ticker}` : `0 ${smartContract.ticker}`
    };

    const { mutate: createRoom, isPending: isCreatingRoom } = useRoomCreation({
        onSuccess: (data) => {
            setConnectionDetails(data);
        },
    });

    useEffect(() => {
        if (!connectionDetails && !isCreatingRoom && userData) {
            createRoom({ userId, userInfo });
        }
    }, [userId, userInfo, connectionDetails, isCreatingRoom, userData, createRoom]);

    const onDeviceFailure = useCallback((failure?: MediaDeviceFailure) => {
        if (failure) {
            console.error('Device failure:', failure);
        }
    }, []);

    const isLoading = (status !== 'ready' && status !== 'error') || isBalanceLoading || isCreatingRoom;

    return (
        <div className="flex h-[500px] flex-col">
            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Spinner />
                </div>
            ) : !connectionDetails ? (
                <div className="flex justify-center p-8">
                    <Spinner />
                    <p className="ml-2">Connecting to voice assistant...</p>
                </div>
            ) : (
                <LiveKitRoom
                    token={connectionDetails.accessToken}
                    serverUrl={connectionDetails.serverUrl}
                    connect={connectionDetails !== undefined}
                    audio={true}
                    video={false}
                    onMediaDeviceFailure={onDeviceFailure}
                    onDisconnected={() => {
                        setConnectionDetails(undefined);
                    }}
                    className="grid grid-rows-[2fr_1fr] items-center"
                >
                    <VoiceAssistantBars onStateChange={setAgentState} />
                    <div className="flex flex-col items-center justify-center gap-4">
                        <ControlBar agentState={agentState} />
                    </div>
                    <RoomAudioRenderer />
                    <NoAgentNotification state={agentState} />
                </LiveKitRoom>
            )}
        </div>
    )
}

export default VoiceAssistant;