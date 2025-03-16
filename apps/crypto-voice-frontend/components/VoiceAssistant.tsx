import { AgentState } from "@livekit/components-react";
import { useVoiceAssistant } from "@livekit/components-react";
import { BarVisualizer } from "@livekit/components-react";
import { useEffect } from "react";

const VoiceAssistant = (props: { onStateChange: (state: AgentState) => void }) => {
    const { state, audioTrack } = useVoiceAssistant();
    
    useEffect(() => {
        props.onStateChange(state);
    }, [props, state]);

    return (
        <div className="h-[300px] max-w-[90vw] mx-auto">
            <BarVisualizer
                state={state}
                barCount={5}
                trackRef={audioTrack}
                className="agent-visualizer"
                options={{ minHeight: 24 }}
            />
        </div>
    );
}

export default VoiceAssistant;