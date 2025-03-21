import type { AgentState } from "@livekit/components-react";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { ExternalLink, X, AlertCircle } from "lucide-react";

interface NoAgentNotificationProps extends React.PropsWithChildren<object> {
  state: AgentState;
}

export const NoAgentNotification = (props: NoAgentNotificationProps) => {
  const timeToWaitMs = 10_000;
  const timeoutRef = useRef<number | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const agentHasConnected = useRef(false);

  if (
    ["listening", "thinking", "speaking"].includes(props.state) &&
    agentHasConnected.current == false
  ) {
    agentHasConnected.current = true;
  }

  useEffect(() => {
    if (props.state === "connecting") {
      timeoutRef.current = window.setTimeout(() => {
        if (props.state === "connecting" && agentHasConnected.current === false) {
          setShowNotification(true);
        }
      }, timeToWaitMs);
    } else {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      setShowNotification(false);
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [props.state]);

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed left-1/2 w-[95vw] sm:max-w-[90vw] md:max-w-[600px] -translate-x-1/2 top-2 sm:top-6 z-50">
      <Alert variant="default" className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4 bg-[#1F1F1F] border-muted text-xs sm:text-sm">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <AlertCircle className="size-5 text-muted-foreground" />
          <AlertDescription className="text-pretty">
            It&apos;s quiet... too quiet. Is your agent lost? Ensure your agent is properly
            configured and running on your machine.
          </AlertDescription>
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto sm:ml-auto gap-3">
          <a
            href="https://docs.livekit.io/agents/quickstarts/s2s/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 text-primary underline"
          >
            <span>View guide</span>
            <ExternalLink className="size-3" />
          </a>
          <Button 
            onClick={() => setShowNotification(false)}
            variant="ghost" 
            size="icon"
            className="size-6 p-0"
          >
            <X className="size-4 text-muted-foreground" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </Alert>
    </div>
  );
}