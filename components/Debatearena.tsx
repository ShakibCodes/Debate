// 📁 LOCATION: components/DebateArena.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import type { DebateSession, DebateSide } from "@/types/debate";
import { MessageBubble } from "@/components/MessageBubble";
import { FallacyPanel } from "@/components/FallacyPanel";

interface Props {
  session: DebateSession;
  userSide: DebateSide;
  streamingContent: string;
  isStreaming: boolean;
  isLoadingVerdict: boolean;
  error: string | null;
  onSendArgument: (msg: string) => Promise<void>;
  onRequestVerdict: () => Promise<void>;
  onReset: () => void;
}

export function DebateArena({
  session,
  userSide,
  streamingContent,
  isStreaming,
  isLoadingVerdict,
  error,
  onSendArgument,
  onRequestVerdict,
  onReset,
}: Props) {
  const [input, setInput] = useState("");
  const [showFallacies, setShowFallacies] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const aiSide: DebateSide = userSide === "for" ? "against" : "for";

  // Auto-scroll on new messages / streaming
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [session.messages, streamingContent]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isStreaming) return;
    setInput("");
    textareaRef.current && (textareaRef.current.style.height = "auto");
    await onSendArgument(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  // Count total fallacies in this session
  const totalFallacies = session.messages.reduce(
    (sum, m) => sum + (m.fallacies?.length ?? 0),
    0
  );

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--color-arena-bg)" }}
    >

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 border-b"
        style={{
          background: "rgba(10,10,11,0.85)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--color-arena-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Left: title */}
          <div className="flex items-center gap-3">
            <span
              className="font-display text-xl tracking-widest"
              style={{ color: "var(--color-amber-vivid)" }}
            >
              DEBATE ARENA
            </span>
            <span
              className="hidden sm:block font-mono text-xs px-2 py-0.5 rounded border truncate max-w-[240px]"
              style={{
                borderColor: "var(--color-arena-muted)",
                color: "var(--color-text-muted)",
              }}
            >
              {session.topic}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {/* Fallacy badge */}
            {totalFallacies > 0 && (
              <button
                onClick={() => setShowFallacies(!showFallacies)}
                className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded border transition-all cursor-pointer"
                style={{
                  background: showFallacies ? "rgba(245,158,11,0.12)" : "transparent",
                  borderColor: showFallacies ? "var(--color-amber-vivid)" : "var(--color-arena-border)",
                  color: "var(--color-amber-vivid)",
                }}
              >
                ⚠ {totalFallacies} {totalFallacies === 1 ? "FALLACY" : "FALLACIES"}
              </button>
            )}

            {/* Verdict button */}
            {session.messages.length >= 4 && (
              <button
                onClick={onRequestVerdict}
                disabled={isLoadingVerdict || isStreaming}
                className="font-mono text-xs px-3 py-1.5 rounded border transition-all cursor-pointer disabled:opacity-40"
                style={{
                  borderColor: "var(--color-against-primary)",
                  color: "var(--color-against-primary)",
                  background: "transparent",
                }}
              >
                {isLoadingVerdict ? "JUDGING..." : "⚖ VERDICT"}
              </button>
            )}

            {/* Reset */}
            <button
              onClick={onReset}
              className="font-mono text-xs px-3 py-1.5 rounded border transition-all cursor-pointer"
              style={{
                borderColor: "var(--color-arena-muted)",
                color: "var(--color-text-muted)",
              }}
            >
              ✕ EXIT
            </button>
          </div>
        </div>
      </header>

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 py-4 gap-4">

        {/* ── Side labels (desktop) ─────────────────────────────────────── */}
        <div className="hidden lg:flex flex-col items-center pt-2 w-28 flex-shrink-0">
          <div
            className="font-display text-4xl tracking-widest"
            style={{ color: "var(--color-for-primary)" }}
          >
            FOR
          </div>
          <div
            className="font-mono text-[10px] mt-1 uppercase tracking-widest"
            style={{ color: "var(--color-text-muted)" }}
          >
            {userSide === "for" ? "you" : "AI"}
          </div>
        </div>

        {/* ── Chat column ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Messages scroll area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto pb-4 space-y-4"
            style={{ maxHeight: "calc(100dvh - 14rem)" }}
          >
            {session.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 animate-fade-in">
                <div
                  className="font-display text-5xl mb-3"
                  style={{ color: "var(--color-arena-border)" }}
                >
                  VS
                </div>
                <p
                  className="font-mono text-xs text-center"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Make your opening argument below
                </p>
              </div>
            )}

            {session.messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isUser={msg.side === userSide}
                animationDelay={i < 3 ? i * 100 : 0}
              />
            ))}

            {/* Streaming AI bubble */}
            {isStreaming && streamingContent && (
              <div
                className="flex justify-start animate-fade-in"
              >
                <div
                  className="max-w-[80%] rounded px-4 py-3 border side-against-bg"
                  style={{ borderColor: "var(--color-against-dim)" }}
                >
                  <div
                    className="font-mono text-[10px] uppercase tracking-widest mb-1"
                    style={{ color: "var(--color-against-primary)" }}
                  >
                    {aiSide.toUpperCase()} · AI
                  </div>
                  <p
                    className="font-body text-base leading-relaxed streaming-cursor"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {streamingContent}
                  </p>
                </div>
              </div>
            )}

            {/* Thinking indicator */}
            {isStreaming && !streamingContent && (
              <div className="flex justify-start animate-fade-in">
                <div
                  className="rounded px-4 py-3 border"
                  style={{
                    background: "var(--color-against-glow)",
                    borderColor: "var(--color-against-dim)",
                  }}
                >
                  <div
                    className="font-mono text-xs flex items-center gap-2"
                    style={{ color: "var(--color-against-primary)" }}
                  >
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse delay-100">●</span>
                    <span className="animate-pulse delay-200">●</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className="rounded border px-4 py-3 font-mono text-sm animate-fade-in"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  borderColor: "var(--color-against-primary)",
                  color: "var(--color-against-primary)",
                }}
              >
                ✕ {error}
              </div>
            )}
          </div>

          {/* ── Input bar ─────────────────────────────────────────────── */}
          <div
            className="mt-3 rounded border p-3 flex gap-3 items-end"
            style={{
              background: "var(--color-arena-card)",
              borderColor: "var(--color-arena-border)",
            }}
          >
            {/* Side badge */}
            <div
              className="font-display text-sm tracking-widest pb-2.5 flex-shrink-0"
              style={{
                color: userSide === "for"
                  ? "var(--color-for-primary)"
                  : "var(--color-against-primary)",
              }}
            >
              {userSide.toUpperCase()}
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={autoResize}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Type your argument… (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none font-body text-base placeholder:opacity-25 disabled:opacity-40"
              style={{
                color: "var(--color-text-primary)",
                minHeight: "2.5rem",
                lineHeight: "1.6",
              }}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 px-4 py-2 rounded font-mono text-sm tracking-widest transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: input.trim() && !isStreaming
                  ? "var(--color-amber-vivid)"
                  : "var(--color-arena-muted)",
                color: input.trim() && !isStreaming ? "#0a0a0b" : "var(--color-text-muted)",
              }}
            >
              SEND
            </button>
          </div>

          <p
            className="font-mono text-[10px] mt-1.5 text-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            {session.messages.length < 4
              ? `${4 - session.messages.length} more exchange${4 - session.messages.length === 1 ? "" : "s"} until verdict available`
              : "Verdict available — or keep debating"}
          </p>
        </div>

        {/* ── Right side label (desktop) ────────────────────────────── */}
        <div className="hidden lg:flex flex-col items-center pt-2 w-28 flex-shrink-0">
          <div
            className="font-display text-4xl tracking-widest"
            style={{ color: "var(--color-against-primary)" }}
          >
          
          </div>
          <div
            className="font-mono text-[10px] mt-1 uppercase tracking-widest"
            style={{ color: "var(--color-text-muted)" }}
          >
            {aiSide === "against" ? "AI" : "you"}
          </div>
        </div>
      </div>

      {/* ── Fallacy panel (slide-in overlay) ─────────────────────────────── */}
      {showFallacies && (
        <FallacyPanel
          messages={session.messages}
          onClose={() => setShowFallacies(false)}
        />
      )}
    </div>
  );
}