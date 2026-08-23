import { createPromptWithId } from "./prompts";
import { proposeChallenge } from "./challenges";
import { createCircle } from "./circles";
import { DAILY_PROMPTS } from "./promptBank/daily";
import { TIME_SENSITIVE_PROMPTS } from "./promptBank/timeSensitive";
import type { PromptDoc } from "./types";

// Master prompt bank, assembled from the two hand-edited banks in
// firebase/promptBank/ — daily.ts (no timer) and timeSensitive.ts
// (timeLimitSeconds required, so startTimeSensitiveChallenge knows how
// long the window is). Add/tweak prompts in those files, not here.
const PROMPT_BANK: (PromptDoc & { id: string })[] = [...DAILY_PROMPTS, ...TIME_SENSITIVE_PROMPTS];

// Dev-only. Writes every prompt in PROMPT_BANK to /prompts/{id},
// skipping any id that's already there — safe to call repeatedly as the
// bank grows over time. Call this once (e.g. from a temp dev button) to
// populate a fresh Firestore project, and again any time PROMPT_BANK
// changes.
export async function seedPrompts(): Promise<{ created: number; skipped: number }> {
  const results = await Promise.all(PROMPT_BANK.map(({ id, ...prompt }) => createPromptWithId(id, prompt)));
  return {
    created: results.filter((r) => r === "created").length,
    skipped: results.filter((r) => r === "skipped").length,
  };
}

// Dev-only. Firestore collections don't exist until something writes to
// them, so there's nothing to test against on a fresh project. This
// seeds the prompt bank (if it isn't already there), then creates a
// small, real dataset: one circle with the signed-in user as its only
// member, and that circle's first challenge (pulled the same way the
// real Lobby flow pulls one) so the wager/agreement/scoreboard/snap
// flow can be exercised end to end. Safe to call more than once — each
// call adds its own fresh circle.
export async function seedDevData(userId: string): Promise<{ circleId: string; challengeId: string }> {
  await seedPrompts();

  const { circleId } = await createCircle("Dev Test Circle", userId);

  const challengeId = await proposeChallenge(circleId, userId, "loser buys a round of drinks", 24);

  return { circleId, challengeId };
}
