import Image from "next/image";
import React from "react";

type AgentProps = {
  isSpeaking?: boolean;
};

const Agent = ({ isSpeaking = false }: AgentProps) => {
  return (
    <div className="relative w-full h-full rounded-t-[22px] overflow-hidden">
      <p className="absolute top-0 right-0 z-10 p-2 bg-accent/50 rounded-bl-[12px] rounded-tr-[22px] text-foreground text-sm">
        Alex
      </p>
      <Image
        src="/login/ai-agent.png"
        width={120}
        height={120}
        alt="AVATAR"
        className="absolute inset-0 m-auto rounded-full border-3 border-background ring-3 ring-accent z-3"
      />
      {isSpeaking && (
        <span className="absolute inset-0 m-auto inline-flex w-25 h-25 animate-ping rounded-full bg-accent/75 z-2" />
      )}
    </div>
  );
};

export default Agent;
