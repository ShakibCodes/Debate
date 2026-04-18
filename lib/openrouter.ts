/**
 * Thin wrapper around the OpenRouter API.
 * Keeps all fetch logic in one place so routes stay clean.
 */

export const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

/** Model used for streaming debate turns */
export const DEBATE_MODEL = "openrouter/free";

/** Model used for fast JSON analysis (fallacy detection, verdict) */
export const ANALYSIS_MODEL = "openrouter/free";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterStreamOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterJSONOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");
  return key;
}

function baseHeaders() {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    "X-Title": "AI Debate Arena",
  };
}

// ─── Streaming ────────────────────────────────────────────────────────────────

/**
 * Returns a raw Response with a ReadableStream of SSE chunks.
 * Pass this directly into a Next.js streaming route response.
 */
export async function streamChat(
  options: OpenRouterStreamOptions
): Promise<Response> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: baseHeaders(),
    body: JSON.stringify({
      model: options.model ?? DEBATE_MODEL,
      messages: options.messages,
      temperature: options.temperature ?? 0.85,
      max_tokens: options.max_tokens ?? 512,
      stream: true,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`OpenRouter stream error ${res.status}: ${error}`);
  }

  return res;
}

// ─── JSON (non-streaming) ─────────────────────────────────────────────────────

/**
 * Calls OpenRouter and returns the full assistant message as a string.
 * Intended for JSON-mode requests (fallacy detection, verdict).
 */
export async function chatJSON(options: OpenRouterJSONOptions): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: baseHeaders(),
    body: JSON.stringify({
      model: options.model ?? ANALYSIS_MODEL,
      messages: options.messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.max_tokens ?? 1024,
      stream: false,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`OpenRouter JSON error ${res.status}: ${error}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenRouter");
  return content;
}

// ─── SSE Transform ────────────────────────────────────────────────────────────

/**
 * Transforms the raw OpenRouter SSE stream into a clean text stream
 * that yields only the token strings.
 */
export function createTokenStream(upstreamResponse: Response): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      const reader = upstreamResponse.body!.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const token: string =
                parsed?.choices?.[0]?.delta?.content ?? "";
              if (token) {
                controller.enqueue(encoder.encode(token));
              }
            } catch {
              // malformed chunk — skip
            }
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
  });
}