// 📁 LOCATION: components/FallacyPanel.tsx

"use client";

import type { DebateMessage, Fallacy } from "@/types/debate";

const SEVERITY_COLOR = {
  low: "#6b7280",
  medium: "#f59e0b",
  high: "#ef4444",
};

const SEVERITY_LABEL = {
  low: "LOW",
  medium: "MED",
  high: "HIGH",
};

interface Props {
  messages: DebateMessage[];
  onClose: () => void;
}

interface FallacyWithContext extends Fallacy {
  side: "for" | "against";
  isAI: boolean;
}

export function FallacyPanel({ messages, onClose }: Props) {
  // Flatten all fallacies with context
  const allFallacies: FallacyWithContext[] = messages.flatMap((m) =>
    (m.fallacies ?? []).map((f) => ({
      ...f,
      side: m.side,
      isAI: m.role === "assistant",
    }))
  );

  const forFallacies = allFallacies.filter((f) => f.side === "for");
  const againstFallacies = allFallacies.filter((f) => f.side === "against");

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-sm flex flex-col border-l animate-fade-slide-up"
        style={{
          background: "var(--color-arena-card)",
          borderColor: "var(--color-arena-border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--color-arena-border)" }}
        >
          <div>
            <h2
              className="font-display text-2xl tracking-widest"
              style={{ color: "var(--color-amber-vivid)" }}
            >
              FALLACIES
            </h2>
            <p
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}
            >
              {allFallacies.length} detected
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-sm px-3 py-1.5 rounded border cursor-pointer transition-all"
            style={{
              borderColor: "var(--color-arena-muted)",
              color: "var(--color-text-muted)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {allFallacies.length === 0 ? (
            <div
              className="text-center py-12 font-mono text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              No fallacies detected yet.
              <br />
              Keep arguing…
            </div>
          ) : (
            <>
              <FallacyGroup title="FOR" color="var(--color-for-primary)" items={forFallacies} />
              <FallacyGroup title="AGAINST" color="var(--color-against-primary)" items={againstFallacies} />
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function FallacyGroup({
  title,
  color,
  items,
}: {
  title: string;
  color: string;
  items: FallacyWithContext[];
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3
        className="font-display text-lg tracking-widest mb-3"
        style={{ color }}
      >
        {title} · {items.length}
      </h3>
      <div className="space-y-3">
        {items.map((f, i) => (
          <div
            key={i}
            className="rounded border p-3"
            style={{
              background: `${SEVERITY_COLOR[f.severity]}0d`,
              borderColor: `${SEVERITY_COLOR[f.severity]}33`,
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="font-mono text-xs font-semibold"
                style={{ color: SEVERITY_COLOR[f.severity] }}
              >
                {f.label}
              </span>
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  background: `${SEVERITY_COLOR[f.severity]}22`,
                  color: SEVERITY_COLOR[f.severity],
                }}
              >
                {SEVERITY_LABEL[f.severity]}
              </span>
            </div>
            <p
              className="font-body text-sm italic mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              "{f.excerpt}"
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              {f.explanation}
            </p>
            <p
              className="font-mono text-[10px] mt-1.5"
              style={{ color: "var(--color-arena-muted)" }}
            >
              {f.isAI ? "— AI argument" : "— Your argument"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}