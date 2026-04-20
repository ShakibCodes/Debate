import { NextRequest } from "next/server";
import { chatJSON } from "@/lib/groq";
import { getVerdictSystemPrompt, getVerdictUserPrompt } from "@/lib/prompts";
import type { VerdictRequest, VerdictResponse } from "@/types/debate";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body: VerdictRequest = await req.json();
    const { topic, messages } = body;

    if (!topic?.trim()) {
      return Response.json({ error: "topic is required" }, { status: 400 });
    }
    if (!Array.isArray(messages) || messages.length < 2) {
      return Response.json(
        { error: "At least 2 messages required for a verdict" },
        { status: 400 }
      );
    }

    const rawJson = await chatJSON({
      messages: [
        { role: "system", content: getVerdictSystemPrompt() },
        { role: "user", content: getVerdictUserPrompt(topic, messages) },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    });

    let verdict: VerdictResponse;
    try {
      verdict = JSON.parse(rawJson);
    } catch {
      console.error("[/api/verdict] Failed to parse JSON:", rawJson);
      return Response.json(
        { error: "Failed to parse verdict from model" },
        { status: 500 }
      );
    }

    if (!verdict.winner || !verdict.forScore || !verdict.againstScore || !verdict.summary) {
      return Response.json(
        { error: "Verdict response is missing required fields" },
        { status: 500 }
      );
    }

    return Response.json(verdict);
  } catch (err: unknown) {
    console.error("[/api/verdict] error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}