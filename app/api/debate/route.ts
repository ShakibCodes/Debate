// 📁 LOCATION: app/api/debate/route.ts

import { NextRequest } from "next/server";
import { streamChat, createTokenStream } from "@/lib/openrouter";
import { getDebateSystemPrompt } from "@/lib/prompts";
import type { DebateStreamRequest } from "@/types/debate";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body: DebateStreamRequest = await req.json();
    const { topic, side, history, userMessage } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!topic?.trim()) {
      return new Response(JSON.stringify({ error: "topic is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (side !== "for" && side !== "against") {
      return new Response(JSON.stringify({ error: "side must be 'for' or 'against'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!userMessage?.trim()) {
      return new Response(JSON.stringify({ error: "userMessage is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Build messages ────────────────────────────────────────────────────────
    const systemPrompt = getDebateSystemPrompt(topic, side);

    // Convert debate history to OpenRouter format.
    // The AI always plays the `side` we were given, so its messages are "assistant".
    // The human is always "user".
    const historyMessages = history.map((m) => ({
      role: (m.side === side ? "assistant" : "user") as "assistant" | "user",
      content: m.content,
    }));

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...historyMessages,
      { role: "user" as const, content: userMessage },
    ];

    // ── Stream from OpenRouter ────────────────────────────────────────────────
    const upstreamResponse = await streamChat({ messages });
    const tokenStream = createTokenStream(upstreamResponse);

    return new Response(tokenStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
        // Allow client to read headers in CORS context if needed
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    console.error("[/api/debate] error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}