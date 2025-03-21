import { AgentState, VoiceAssistantControlBar, DisconnectButton } from "@livekit/components-react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

const ControlBar = (props: { agentState: AgentState }) => {
    return (
        <div className="relative h-[80px] sm:h-[100px] w-full">
            <AnimatePresence>
                {props.agentState !== "disconnected" && props.agentState !== "connecting" && (
                    <motion.div
                        initial={{ opacity: 0, top: "10px" }}
                        animate={{ opacity: 1, top: 0 }}
                        exit={{ opacity: 0, top: "-10px" }}
                        transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
                        className="flex h-8 absolute left-1/2 -translate-x-1/2 justify-center w-full max-w-[280px] sm:max-w-[350px]"
                    >
                        <VoiceAssistantControlBar 
                            controls={{ leave: false }} 
                            className="scale-90 sm:scale-100"
                        />
                        <DisconnectButton className="bg-red-500 text-white text-xs sm:text-sm h-8 px-2 sm:px-4">
                            Close
                        </DisconnectButton>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ControlBar;