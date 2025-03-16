'use client';

import { AgentState, LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { MediaDeviceFailure } from "livekit-client";
import { useCallback, useState } from "react";
import { CreateRoomButton } from "../components/CreateRoomButton";
import { Room as RoomType } from "../types/room";
import VoiceAssistant from "@/components/VoiceAssistant";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import ControlBar from "@/components/ControlBar";

const Home = () => {
    const [connectionDetails, setConnectionDetails] = useState<RoomType | undefined>();
    const [agentState, setAgentState] = useState<AgentState>("disconnected");
    
    const onDeviceFailure = useCallback((failure?: MediaDeviceFailure) => {
        if (failure) {
            console.error('Device failure:', failure);
        }
    }, []);
    
    const updateConnectionDetails = (details: RoomType | undefined) => {
        setConnectionDetails(details);
    };
    
    const handleRoomCreated = (room: RoomType) => {
        updateConnectionDetails(room);
    };

    return (
        <main data-lk-theme="default" className="h-full grid content-center bg-[var(--lk-bg)]">
            {!connectionDetails ? (
                <div className="flex justify-center p-8">
                    <CreateRoomButton 
                        userId="user-123" // Replace with actual user ID
                        onRoomCreated={handleRoomCreated} 
                    />
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
                        updateConnectionDetails(undefined);
                    }}
                    className="grid grid-rows-[2fr_1fr] items-center"
                >
                    <VoiceAssistant onStateChange={setAgentState} />
                    <ControlBar agentState={agentState} />
                    <RoomAudioRenderer />
                    <NoAgentNotification state={agentState} />
                </LiveKitRoom>
            )}
        </main>
    )
}

export default Home;