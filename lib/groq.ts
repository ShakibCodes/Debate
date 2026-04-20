export const GROQ_BASE = "https://api.groq.com/openai/v1";

/**
 * Best free Groq models for debate:
 * - llama-3.3-70b-versatile  → smartest, best arguments (recommended)
 * - llama3-8b-8192           → fastest, lighter
 * - mixtral-8x7b-32768       → good reasoning, large context
 */
export const DEBATE_MODEL  = "llama-3.3-70b-versatile";
export const ANALYSIS_MODEL = "llama-3.3-70b-versatile";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqStreamOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface GroqJSONOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");
  return key;
}

function baseHeaders() {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Streaming ────────────────────────────────────────────────────────────────

export async function streamChat(
  options: GroqStreamOptions,
  retries = 3
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(`${GROQ_BASE}/chat/completions`, {
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

    if (res.ok) return res;

    if (res.status === 429 && attempt < retries - 1) {
      const waitMs = 1500 * (attempt + 1);
      console.warn(`[groq] 429 rate limit, retrying in ${waitMs}ms (attempt ${attempt + 1}/${retries})`);
      await sleep(waitMs);
      continue;
    }

    const error = await res.text();
    throw new Error(`Groq stream error ${res.status}: ${error}`);
  }

  throw new Error("Groq stream failed after max retries");
}

// ─── JSON (non-streaming) ─────────────────────────────────────────────────────

export async function chatJSON(
  options: GroqJSONOptions,
  retries = 3
): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(`${GROQ_BASE}/chat/completions`, {
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

    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from Groq");
      return content;
    }

    if (res.status === 429 && attempt < retries - 1) {
      const waitMs = 1500 * (attempt + 1);
      console.warn(`[groq] 429 rate limit, retrying in ${waitMs}ms (attempt ${attempt + 1}/${retries})`);
      await sleep(waitMs);
      continue;
    }

    const error = await res.text();
    throw new Error(`Groq JSON error ${res.status}: ${error}`);
  }

  throw new Error("Groq JSON failed after max retries");
}

// ─── SSE Transform ────────────────────────────────────────────────────────────

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
              const token: string = parsed?.choices?.[0]?.delta?.content ?? "";
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