// ─── Debate Sides ────────────────────────────────────────────────────────────

export type DebateSide = "for" | "against";

// ─── Message ─────────────────────────────────────────────────────────────────

export interface DebateMessage {
  id: string;
  role: "user" | "assistant";
  side: DebateSide;
  content: string;
  timestamp: number;
  /** Populated after /api/analyze runs */
  fallacies?: Fallacy[];
}

// ─── Fallacy ──────────────────────────────────────────────────────────────────

export type FallacyType =
  | "ad_hominem"
  | "straw_man"
  | "false_dichotomy"
  | "slippery_slope"
  | "appeal_to_authority"
  | "hasty_generalization"
  | "red_herring"
  | "circular_reasoning"
  | "appeal_to_emotion"
  | "bandwagon";

export interface Fallacy {
  type: FallacyType;
  label: string;
  /** Short excerpt from the message that triggered the fallacy */
  excerpt: string;
  /** One-sentence explanation */
  explanation: string;
  severity: "low" | "medium" | "high";
}

// ─── Analyze API ──────────────────────────────────────────────────────────────

export interface AnalyzeRequest {
  messageId: string;
  content: string;
  side: DebateSide;
  topic: string;
}

export interface AnalyzeResponse {
  messageId: string;
  fallacies: Fallacy[];
}

// ─── Verdict / Score ──────────────────────────────────────────────────────────

export interface SideScore {
  score: number; // 0–100
  strengths: string[];
  weaknesses: string[];
  fallacyCount: number;
}

export interface VerdictResponse {
  winner: DebateSide | "draw";
  forScore: SideScore;
  againstScore: SideScore;
  summary: string;
  /** Key turning point in the debate */
  keyMoment: string;
}

// ─── Debate Session ───────────────────────────────────────────────────────────

export type DebateStatus = "idle" | "active" | "finished";

export interface DebateSession {
  id: string;
  topic: string;
  status: DebateStatus;
  messages: DebateMessage[];
  verdict?: VerdictResponse;
  createdAt: number;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface DebateStreamRequest {
  topic: string;
  side: DebateSide;
  /** Full conversation history so the model has context */
  history: Pick<DebateMessage, "role" | "content" | "side">[];
  /** The user's latest argument */
  userMessage: string;
}

export interface VerdictRequest {
  topic: string;
  messages: Pick<DebateMessage, "side" | "content" | "fallacies">[];
}