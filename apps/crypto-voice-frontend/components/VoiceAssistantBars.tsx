import { AgentState } from "@livekit/components-react";
import { useVoiceAssistant } from "@livekit/components-react";
import { BarVisualizer } from "@livekit/components-react";
import { useEffect } from "react";

const VoiceAssistantBars = (props: { onStateChange: (state: AgentState) => void }) => {
    const { state, audioTrack } = useVoiceAssistant();
    
    useEffect(() => {
        props.onStateChange(state);
    }, [props, state]);

    return (
        <div className="w-full h-[220px] sm:h-[250px] md:h-[300px]">
            <BarVisualizer
                state={state}
                barCount={5}
                trackRef={audioTrack}
                className="agent-visualizer w-full h-full"
                options={{ minHeight: 24 }}
            />
        </div>
    );
}

export default VoiceAssistantBars;