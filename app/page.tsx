"use client"

import { useState } from "react";
import { useDebate } from "@/hooks/useDebate";
import { SetupScreen } from "@/components/SetupScreen";
import { DebateArena } from "@/components/Debatearena";
import { VerdictScreen } from "@/components/VerdictScreen";
import type { DebateSide } from "@/types/debate";
export default function Home() {
  const debate = useDebate();
  const [userSide, setUserSide] = useState<DebateSide>("for");
 
  const handleStart = (topic: string, side: DebateSide) => {
    setUserSide(side);
    debate.startDebate(topic, side);
  };
 
  // ── Screens ──────────────────────────────────────────────────────────────
 
  if (!debate.session) {
    return <SetupScreen onStart={handleStart} />;
  }
 
  if (debate.session.status === "finished" && debate.session.verdict) {
    return (
      <VerdictScreen
        verdict={debate.session.verdict}
        topic={debate.session.topic}
        userSide={userSide}
        onReset={debate.reset}
      />
    );
  }
 
  return (
    <DebateArena
      session={debate.session}
      userSide={userSide}
      streamingContent={debate.streamingContent}
      isStreaming={debate.isStreaming}
      isLoadingVerdict={debate.isLoadingVerdict}
      error={debate.error}
      onSendArgument={debate.sendArgument}
      onRequestVerdict={debate.requestVerdict}
      onReset={debate.reset}
    />
  );
}