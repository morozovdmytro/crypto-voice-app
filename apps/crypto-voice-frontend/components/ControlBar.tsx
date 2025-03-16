import { AgentState, VoiceAssistantControlBar, DisconnectButton } from "@livekit/components-react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

const ControlBar = (props: { agentState: AgentState }) => {
    return (
        <div className="relative h-[100px]">
            <AnimatePresence>
                {props.agentState !== "disconnected" && props.agentState !== "connecting" && (
                    <motion.div
                        initial={{ opacity: 0, top: "10px" }}
                        animate={{ opacity: 1, top: 0 }}
                        exit={{ opacity: 0, top: "-10px" }}
                        transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
                        className="flex h-8 absolute left-1/2 -translate-x-1/2 justify-center"
                    >
                        <VoiceAssistantControlBar controls={{ leave: false }} />
                        <DisconnectButton className="bg-red-500 text-white">
                            Close
                        </DisconnectButton>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ControlBar;