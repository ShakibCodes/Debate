// 📁 LOCATION: components/SetupScreen.tsx

"use client";

import { useState } from "react";
import type { DebateSide } from "@/types/debate";

const EXAMPLE_TOPICS = [
  "Social media does more harm than good",
  "AI will replace most human jobs within 20 years",
  "Universal Basic Income should be implemented globally",
  "Space exploration is a waste of resources",
  "Nuclear energy is the future of clean power",
];

interface Props {
  onStart: (topic: string, side: DebateSide) => void;
}

export function SetupScreen({ onStart }: Props) {
  const [topic, setTopic] = useState("");
  const [side, setSide] = useState<DebateSide>("for");

  const handleSubmit = () => {
    const t = topic.trim();
    if (!t) return;
    onStart(t, side);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 py-16 relative">

      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(245,158,11,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="text-center mb-14 animate-fade-slide-up">
        <div
          className="font-mono text-xs tracking-[0.3em] uppercase mb-4"
          style={{ color: "var(--color-amber-vivid)" }}
        >
          — Welcome to —
        </div>
        <h1
          className="font-display text-[clamp(4rem,12vw,9rem)] leading-none tracking-wide mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          AI DEBATE
          <br />
          <span className="gradient-text-amber">ARENA</span>
        </h1>
        <p
          className="font-body text-lg max-w-md mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Pick a topic, choose your side, and go head-to-head with AI.
          Every argument is analyzed for logic and fallacies in real time.
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-2xl rounded-[var(--radius-arena)] border p-8 animate-fade-slide-up delay-200"
        style={{
          background: "var(--color-arena-card)",
          borderColor: "var(--color-arena-border)",
        }}
      >

        {/* Topic input */}
        <div className="mb-7">
          <label
            className="font-mono text-xs uppercase tracking-widest mb-3 block"
            style={{ color: "var(--color-amber-vivid)" }}
          >
            Debate Topic
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Social media does more harm than good"
            rows={2}
            className="w-full rounded-[var(--radius-arena)] border px-4 py-3 font-body text-base resize-none outline-none transition-all duration-200 placeholder:opacity-30"
            style={{
              background: "var(--color-arena-surface)",
              borderColor: "var(--color-arena-border)",
              color: "var(--color-text-primary)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-amber-vivid)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-arena-border)";
            }}
          />
        </div>

        {/* Example topics */}
        <div className="mb-8">
          <p
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            Or pick one:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className="font-body text-sm px-3 py-1.5 rounded border transition-all duration-150 cursor-pointer"
                style={{
                  background: topic === t ? "rgba(245,158,11,0.1)" : "transparent",
                  borderColor: topic === t ? "var(--color-amber-vivid)" : "var(--color-arena-muted)",
                  color: topic === t ? "var(--color-amber-vivid)" : "var(--color-text-secondary)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Side picker */}
        <div className="mb-8">
          <label
            className="font-mono text-xs uppercase tracking-widest mb-3 block"
            style={{ color: "var(--color-amber-vivid)" }}
          >
            Your Side
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["for", "against"] as DebateSide[]).map((s) => {
              const isFor = s === "for";
              const active = side === s;
              return (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className="relative py-4 px-6 rounded border text-left transition-all duration-200 cursor-pointer overflow-hidden"
                  style={{
                    borderColor: active
                      ? isFor
                        ? "var(--color-for-primary)"
                        : "var(--color-against-primary)"
                      : "var(--color-arena-border)",
                    background: active
                      ? isFor
                        ? "var(--color-for-glow)"
                        : "var(--color-against-glow)"
                      : "var(--color-arena-surface)",
                  }}
                >
                  <div
                    className="font-display text-2xl tracking-wide mb-1"
                    style={{
                      color: active
                        ? isFor
                          ? "var(--color-for-primary)"
                          : "var(--color-against-primary)"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    {isFor ? "FOR" : "AGAINST"}
                  </div>
                  <div
                    className="font-mono text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {isFor ? "Argue in favor" : "Argue in opposition"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleSubmit}
          disabled={!topic.trim()}
          className="w-full py-4 rounded font-display text-xl tracking-widest transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: topic.trim()
              ? "var(--color-amber-vivid)"
              : "var(--color-arena-muted)",
            color: topic.trim() ? "#0a0a0b" : "var(--color-text-muted)",
            boxShadow: topic.trim() ? "var(--shadow-glow-amber)" : "none",
          }}
        >
          ENTER THE ARENA
        </button>

        <p
          className="text-center font-mono text-xs mt-3"
          style={{ color: "var(--color-text-muted)" }}
        >
          ⌘ + Enter to start
        </p>
      </div>

      {/* Footer */}
      <div
        className="mt-10 font-mono text-xs tracking-widest animate-fade-in delay-500"
        style={{ color: "var(--color-text-muted)" }}
      >
        POWERED BY OPENROUTER · BUILT WITH NEXT.JS
      </div>
    </main>
  );
}