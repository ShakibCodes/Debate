import { NextRequest } from "next/server";
import { getFallacySystemPrompt, getFallacyUserPrompt} from "@/lib/prompts";
import { chatJSON } from "@/lib/openrouter";
import type { AnalyzeRequest, AnalyzeResponse, } from "@/types/debate";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequest = await req.json();
    const { messageId, content, side, topic } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!messageId || !content?.trim() || !topic?.trim()) {
      return Response.json(
        { error: "messageId, content, and topic are required" },
        { status: 400 }
      );
    }

    // ── Call OpenRouter (JSON mode) ───────────────────────────────────────────
    const rawJson = await chatJSON({
      messages: [
        { role: "system", content: getFallacySystemPrompt() },
        { role: "user", content: getFallacyUserPrompt(content, side, topic) },
      ],
      max_tokens: 800,
    });

    // ── Parse ─────────────────────────────────────────────────────────────────
    let parsed: { fallacies: AnalyzeResponse["fallacies"] };
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      console.error("[/api/analyze] Failed to parse JSON:", rawJson);
      // Fail gracefully — return empty fallacies rather than 500
      parsed = { fallacies: [] };
    }

    const response: AnalyzeResponse = {
      messageId,
      fallacies: parsed.fallacies ?? [],
    };

    return Response.json(response);
  } catch (err: unknown) {
    console.error("[/api/analyze] error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}