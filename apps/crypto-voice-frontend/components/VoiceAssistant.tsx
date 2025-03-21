'use client';

import { AgentState, LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { MediaDeviceFailure, RoomOptions } from "livekit-client";
import { useCallback, useState } from "react";
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
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { Button } from "./ui/button";
import TransactionHandler from "./TransactionHandler";
import TransferHandler from "./TransferHandler";

const VoiceAssistant = () => {
    const [connectionDetails, setConnectionDetails] = useState<RoomType | undefined>();
    const [agentState, setAgentState] = useState<AgentState>("disconnected");
    const [showStartButton, setShowStartButton] = useState(true);
    const { userData, status } = useUserData();
    const { address } = useSmartAccount();
    const { smartContract } = useSmartContracts();
    const { balance, loading: isBalanceLoading } = useBalanceOf(smartContract.address as `0x${string}`);

    const { mutate: createRoom, isPending: isCreatingRoom } = useRoomCreation({
        onSuccess: (data) => {
            setConnectionDetails(data);
            setShowStartButton(false);
        },
    });

    const handleStartConversation = () => {
        if (!isCreatingRoom && userData && address) {
            const userInfo = {
                name: userData?.name,
                balance: balance ? `${formatTokenAmount(balance)} ${smartContract.ticker}` : `0 ${smartContract.ticker}`,
                address
            }
            createRoom({ userId: address, userInfo });
        }
    };

    const onDeviceFailure = useCallback((failure?: MediaDeviceFailure) => {
        if (failure) {
            console.error('Device failure:', failure);
        }
    }, []);

    const roomOptions: RoomOptions = {
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
            simulcast: false,
            stopMicTrackOnMute: false
        },
        audioCaptureDefaults: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }
    };

    const isLoading = (status !== 'ready' && status !== 'error') || isBalanceLoading;

    return (
        <div className="flex flex-col h-full min-h-[400px] sm:min-h-[450px] md:min-h-[500px] w-full">
            {isLoading ? (
                <div className="flex justify-center items-center flex-grow p-4">
                    <Spinner color="main" size="large"/>
                </div>
            ) : showStartButton ? (
                <div className="flex flex-col items-center justify-center gap-4 h-full">
                    <h3 className="text-lg sm:text-xl font-medium text-center px-2">Ready to start your crypto conversation?</h3>
                    <Button 
                        onClick={handleStartConversation} 
                        disabled={isCreatingRoom}
                        className="px-4 sm:px-6 py-2 text-base sm:text-lg"
                    >
                        {isCreatingRoom ? (
                            <>
                                <Spinner color="white" size="small" className="mr-2" />
                                Connecting...
                            </>
                        ) : (
                            "Start Conversation"
                        )}
                    </Button>
                </div>
            ) : !connectionDetails ? (
                <div className="flex justify-center items-center flex-grow p-4">
                    <Spinner color="main" size="large"/>
                    <p className="ml-2 text-sm sm:text-base">Connecting to voice assistant...</p>
                </div>
            ) : (
                <LiveKitRoom
                    token={connectionDetails.accessToken}
                    serverUrl={connectionDetails.serverUrl}
                    connect={connectionDetails !== undefined}
                    audio={true}
                    video={false}
                    options={roomOptions}
                    onMediaDeviceFailure={onDeviceFailure}
                    onDisconnected={() => {
                        setConnectionDetails(undefined);
                        setShowStartButton(true);
                    }}
                    className="grid grid-rows-[2fr_1fr] items-center h-full w-full"
                >
                    <VoiceAssistantBars onStateChange={setAgentState} />
                    <div className="flex flex-col items-center justify-center gap-2 sm:gap-4 w-full">
                        <ControlBar agentState={agentState} />
                    </div>
                    <RoomAudioRenderer />
                    <NoAgentNotification state={agentState} />
                    <TransactionHandler />
                    <TransferHandler />
                </LiveKitRoom>
            )}
        </div>
    )
}

export default VoiceAssistant;