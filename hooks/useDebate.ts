"use client";

import { useState, useCallback, useRef } from "react";
import type {
  DebateSession,
  DebateMessage,
  DebateSide,
  VerdictResponse,
  AnalyzeResponse,
} from "@/types/debate";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function makeSession(topic: string): DebateSession {
  return {
    id: makeId(),
    topic,
    status: "idle",
    messages: [],
    createdAt: Date.now(),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseDebateReturn {
  session: DebateSession | null;
  streamingContent: string;
  isStreaming: boolean;
  isAnalyzing: boolean;
  isLoadingVerdict: boolean;
  error: string | null;

  startDebate: (topic: string, userSide: DebateSide) => void;
  sendArgument: (userMessage: string) => Promise<void>;
  requestVerdict: () => Promise<void>;
  reset: () => void;
}

export function useDebate(): UseDebateReturn {
  const [session, setSession] = useState<DebateSession | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingVerdict, setIsLoadingVerdict] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref to the latest session so async callbacks always have fresh state
  const sessionRef = useRef<DebateSession | null>(null);

  const updateSession = useCallback((updater: (s: DebateSession) => DebateSession) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      sessionRef.current = next;
      return next;
    });
  }, []);

  // ── startDebate ────────────────────────────────────────────────────────────

  const startDebate = useCallback((topic: string, userSide: DebateSide) => {
    const newSession: DebateSession = {
      ...makeSession(topic),
      status: "active",
      // Store which side the *user* is on as a convention:
      // The AI always takes the opposite side.
    };
    // We tag it with the userSide so sendArgument knows which side to argue
    (newSession as DebateSession & { userSide: DebateSide }).userSide = userSide;
    sessionRef.current = newSession;
    setSession(newSession);
    setError(null);
    setStreamingContent("");
  }, []);

  // ── sendArgument ───────────────────────────────────────────────────────────

  const sendArgument = useCallback(async (userMessage: string) => {
    const current = sessionRef.current;
    if (!current || current.status !== "active") return;

    const userSide: DebateSide =
      (current as DebateSession & { userSide?: DebateSide }).userSide ?? "for";
    const aiSide: DebateSide = userSide === "for" ? "against" : "for";

    setError(null);

    // 1. Append user message immediately
    const userMsg: DebateMessage = {
      id: makeId(),
      role: "user",
      side: userSide,
      content: userMessage,
      timestamp: Date.now(),
    };

    updateSession((s) => ({
      ...s,
      messages: [...s.messages, userMsg],
    }));

    // 2. Analyze user message for fallacies (fire-and-forget, non-blocking)
    analyzeMessage(userMsg, current.topic, updateSession);

    // 3. Stream AI response
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const history = sessionRef.current!.messages
        .slice(0, -1) // exclude the message we just added (will be sent as userMessage)
        .map((m) => ({ role: m.role, content: m.content, side: m.side }));

      const res = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: current.topic,
          side: aiSide,
          history,
          userMessage,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Stream failed" }));
        throw new Error(err.error ?? "Debate API error");
      }

      // 4. Read the stream token by token
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const token = decoder.decode(value, { stream: true });
        accumulated += token;
        setStreamingContent(accumulated);
      }

      // 5. Finalize AI message
      const aiMsg: DebateMessage = {
        id: makeId(),
        role: "assistant",
        side: aiSide,
        content: accumulated,
        timestamp: Date.now(),
      };

      updateSession((s) => ({
        ...s,
        messages: [...s.messages, aiMsg],
      }));

      setStreamingContent("");

      // 6. Analyze AI message for fallacies
      analyzeMessage(aiMsg, current.topic, updateSession);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setIsStreaming(false);
    }
  }, [updateSession]);

  // ── requestVerdict ─────────────────────────────────────────────────────────

  const requestVerdict = useCallback(async () => {
    const current = sessionRef.current;
    if (!current) return;

    setIsLoadingVerdict(true);
    setError(null);

    try {
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: current.topic,
          messages: current.messages.map((m) => ({
            side: m.side,
            content: m.content,
            fallacies: m.fallacies,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Verdict failed" }));
        throw new Error(err.error ?? "Verdict API error");
      }

      const verdict: VerdictResponse = await res.json();

      updateSession((s) => ({
        ...s,
        status: "finished",
        verdict,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to get verdict";
      setError(msg);
    } finally {
      setIsLoadingVerdict(false);
    }
  }, [updateSession]);

  // ── reset ──────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    sessionRef.current = null;
    setSession(null);
    setStreamingContent("");
    setIsStreaming(false);
    setIsAnalyzing(false);
    setIsLoadingVerdict(false);
    setError(null);
  }, []);

  return {
    session,
    streamingContent,
    isStreaming,
    isAnalyzing,
    isLoadingVerdict,
    error,
    startDebate,
    sendArgument,
    requestVerdict,
    reset,
  };
}

// ─── Internal: fire-and-forget fallacy analysis ───────────────────────────────

async function analyzeMessage(
  message: DebateMessage,
  topic: string,
  updateSession: (updater: (s: DebateSession) => DebateSession) => void
) {
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: message.id,
        content: message.content,
        side: message.side,
        topic,
      }),
    });

    if (!res.ok) return; // silent fail — fallacies are non-critical

    const data: AnalyzeResponse = await res.json();

    if (data.fallacies.length === 0) return;

    // Patch the fallacies into the correct message
    updateSession((s) => ({
      ...s,
      messages: s.messages.map((m) =>
        m.id === data.messageId ? { ...m, fallacies: data.fallacies } : m
      ),
    }));
  } catch {
    // silent fail
  }
}