// 📁 LOCATION: components/VerdictScreen.tsx

"use client";

import type { VerdictResponse, DebateSide } from "@/types/debate";

interface Props {
  verdict: VerdictResponse;
  topic: string;
  userSide: DebateSide;
  onReset: () => void;
}

export function VerdictScreen({ verdict, topic, userSide, onReset }: Props) {
  const userScore = userSide === "for" ? verdict.forScore : verdict.againstScore;
  const aiScore = userSide === "for" ? verdict.againstScore : verdict.forScore;

  const userWon =
    verdict.winner === userSide ||
    (verdict.winner === "draw");

  const resultLabel =
    verdict.winner === "draw"
      ? "DRAW"
      : verdict.winner === userSide
      ? "YOU WIN"
      : "AI WINS";

  const resultColor =
    verdict.winner === "draw"
      ? "var(--color-amber-vivid)"
      : verdict.winner === userSide
      ? "var(--color-for-primary)"
      : "var(--color-against-primary)";

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-start px-4 py-12 relative overflow-x-hidden"
      style={{ background: "var(--color-arena-bg)" }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 50% 35% at 50% 30%, ${resultColor}18 0%, transparent 70%)`,
        }}
      />

      {/* ── Result headline ─────────────────────────────────────────────── */}
      <div className="text-center mb-10 animate-fade-slide-up">
        <p
          className="font-mono text-xs uppercase tracking-[0.3em] mb-3"
          style={{ color: "var(--color-text-muted)" }}
        >
          VERDICT
        </p>
        <h1
          className="font-display leading-none mb-2"
          style={{
            fontSize: "clamp(5rem, 15vw, 10rem)",
            color: resultColor,
            textShadow: `0 0 60px ${resultColor}44`,
          }}
        >
          {resultLabel}
        </h1>
        <p
          className="font-body italic text-lg max-w-xl mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          "{topic}"
        </p>
      </div>

      {/* ── Score cards ──────────────────────────────────────────────────── */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-fade-slide-up delay-100">
        <ScoreCard
          label="YOUR SCORE"
          side={userSide}
          scoreData={userScore}
          highlight={verdict.winner === userSide}
        />
        <ScoreCard
          label="AI SCORE"
          side={userSide === "for" ? "against" : "for"}
          scoreData={aiScore}
          highlight={verdict.winner !== userSide && verdict.winner !== "draw"}
        />
      </div>

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      <div
        className="w-full max-w-3xl rounded border p-6 mb-4 animate-fade-slide-up delay-200"
        style={{
          background: "var(--color-arena-card)",
          borderColor: "var(--color-arena-border)",
        }}
      >
        <p
          className="font-mono text-[10px] uppercase tracking-widest mb-2"
          style={{ color: "var(--color-amber-vivid)" }}
        >
          Judge's Summary
        </p>
        <p
          className="font-body text-lg leading-relaxed"
          style={{ color: "var(--color-text-primary)" }}
        >
          {verdict.summary}
        </p>
      </div>

      {/* ── Key moment ───────────────────────────────────────────────────── */}
      <div
        className="w-full max-w-3xl rounded border-l-2 px-6 py-4 mb-8 animate-fade-slide-up delay-300"
        style={{
          background: "rgba(245,158,11,0.05)",
          borderColor: "var(--color-amber-vivid)",
        }}
      >
        <p
          className="font-mono text-[10px] uppercase tracking-widest mb-1"
          style={{ color: "var(--color-amber-vivid)" }}
        >
          ⚡ Key Turning Point
        </p>
        <p
          className="font-body italic"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {verdict.keyMoment}
        </p>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-3 animate-fade-slide-up delay-400">
        <button
          onClick={onReset}
          className="font-display text-xl tracking-widest px-10 py-4 rounded transition-all cursor-pointer"
          style={{
            background: "var(--color-amber-vivid)",
            color: "#0a0a0b",
            boxShadow: "var(--shadow-glow-amber)",
          }}
        >
          DEBATE AGAIN
        </button>
      </div>
    </main>
  );
}

// ── ScoreCard ──────────────────────────────────────────────────────────────────

function ScoreCard({
  label,
  side,
  scoreData,
  highlight,
}: {
  label: string;
  side: DebateSide;
  scoreData: VerdictResponse["forScore"];
  highlight: boolean;
}) {
  const isFor = side === "for";
  const sideColor = isFor ? "var(--color-for-primary)" : "var(--color-against-primary)";
  const sideDim = isFor ? "var(--color-for-dim)" : "var(--color-against-dim)";

  return (
    <div
      className="rounded border p-5 transition-all"
      style={{
        background: isFor ? "var(--color-for-glow)" : "var(--color-against-glow)",
        borderColor: highlight ? sideColor : sideDim,
        boxShadow: highlight
          ? isFor
            ? "var(--shadow-glow-blue)"
            : "var(--shadow-glow-red)"
          : "none",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-widest mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {label}
          </p>
          <p
            className="font-display text-3xl tracking-wide"
            style={{ color: sideColor }}
          >
            {side.toUpperCase()}
          </p>
        </div>

        {/* Score ring */}
        <div className="text-right">
          <span
            className="font-display text-5xl"
            style={{ color: sideColor }}
          >
            {scoreData.score}
          </span>
          <span
            className="font-mono text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            /100
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div
        className="h-1.5 rounded-full mb-4 overflow-hidden"
        style={{ background: "var(--color-arena-border)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${scoreData.score}%`,
            background: sideColor,
          }}
        />
      </div>

      {/* Strengths */}
      {scoreData.strengths.length > 0 && (
        <div className="mb-3">
          <p
            className="font-mono text-[10px] uppercase tracking-widest mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Strengths
          </p>
          <ul className="space-y-1">
            {scoreData.strengths.map((s, i) => (
              <li
                key={i}
                className="font-body text-sm flex gap-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <span style={{ color: sideColor }}>+</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {scoreData.weaknesses.length > 0 && (
        <div className="mb-3">
          <p
            className="font-mono text-[10px] uppercase tracking-widest mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Weaknesses
          </p>
          <ul className="space-y-1">
            {scoreData.weaknesses.map((w, i) => (
              <li
                key={i}
                className="font-body text-sm flex gap-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <span style={{ color: "var(--color-against-primary)" }}>−</span> {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fallacy count */}
      {scoreData.fallacyCount > 0 && (
        <p
          className="font-mono text-[10px] mt-2"
          style={{ color: "var(--color-amber-vivid)" }}
        >
          ⚠ {scoreData.fallacyCount} {scoreData.fallacyCount === 1 ? "fallacy" : "fallacies"} penalized
        </p>
      )}
    </div>
  );
}