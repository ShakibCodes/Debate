// 📁 LOCATION: components/MessageBubble.tsx

"use client";

import type { DebateMessage } from "@/types/debate";

const SEVERITY_COLOR = {
  low: "#6b7280",
  medium: "#f59e0b",
  high: "#ef4444",
};

interface Props {
  message: DebateMessage;
  isUser: boolean;
  animationDelay?: number;
}

export function MessageBubble({ message, isUser, animationDelay = 0 }: Props) {
  const isFor = message.side === "for";

  return (
    <div
      className="flex animate-fade-slide-up"
      style={{
        justifyContent: isUser ? "flex-end" : "flex-start",
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <div
        className="max-w-[82%] sm:max-w-[75%] rounded border"
        style={{
          background: isFor
            ? "var(--color-for-glow)"
            : "var(--color-against-glow)",
          borderColor: isFor
            ? "var(--color-for-dim)"
            : "var(--color-against-dim)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 pt-3 pb-1 gap-4"
        >
          <span
            className="font-mono text-[10px] uppercase tracking-widest font-semibold"
            style={{
              color: isFor
                ? "var(--color-for-primary)"
                : "var(--color-against-primary)",
            }}
          >
            {message.side.toUpperCase()} · {isUser ? "YOU" : "AI"}
          </span>
          <span
            className="font-mono text-[10px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Content */}
        <p
          className="px-4 pb-3 font-body text-base leading-relaxed"
          style={{ color: "var(--color-text-primary)" }}
        >
          {message.content}
        </p>

        {/* Fallacy pills */}
        {message.fallacies && message.fallacies.length > 0 && (
          <div
            className="px-4 pb-3 pt-1 flex flex-wrap gap-2 border-t"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            {message.fallacies.map((f, i) => (
              <div key={i} className="group relative">
                <span
                  className="font-mono text-[10px] px-2 py-0.5 rounded cursor-default"
                  style={{
                    background: `${SEVERITY_COLOR[f.severity]}22`,
                    color: SEVERITY_COLOR[f.severity],
                    border: `1px solid ${SEVERITY_COLOR[f.severity]}44`,
                  }}
                >
                  ⚠ {f.label}
                </span>

                {/* Tooltip on hover */}
                <div
                  className="absolute bottom-full left-0 mb-2 w-56 rounded border p-3 z-10 hidden group-hover:block animate-fade-in"
                  style={{
                    background: "var(--color-arena-card)",
                    borderColor: SEVERITY_COLOR[f.severity],
                  }}
                >
                  <p
                    className="font-mono text-[10px] uppercase tracking-wider mb-1"
                    style={{ color: SEVERITY_COLOR[f.severity] }}
                  >
                    {f.label}
                  </p>
                  <p
                    className="font-body text-xs italic mb-1"
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}