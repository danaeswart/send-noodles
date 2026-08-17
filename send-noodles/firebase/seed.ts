import { createPromptWithId } from "./prompts";
import { proposeChallenge } from "./challenges";
import { createCircle } from "./circles";
import type { PromptDoc } from "./types";

// Master prompt bank — hand-edit this list to add or tweak prompts.
// Each entry needs a stable, unique, readable id (used as its Firestore
// doc id at /prompts/{id}) plus the PromptDoc fields. 'daily' prompts
// run with no timer (timeLimitSeconds: null); 'time_sensitive' ones
// need a timeLimitSeconds so startTimeSensitiveChallenge knows how long
// the window is.
const PROMPT_BANK: (PromptDoc & { id: string })[] = [
  // daily — no time limit
  {
    id: "daily_green",
    promptText: "find and share something green.",
    type: "daily",
    timeLimitSeconds: null,
    difficulty: "easy",
    tags: ["colour", "outdoors"],
  },
  {
    id: "daily_shoes",
    promptText: "snap the shoes you're wearing right now.",
    type: "daily",
    timeLimitSeconds: null,
    difficulty: "easy",
    tags: ["self", "home"],
  },
  {
    id: "daily_snack",
    promptText: "capture whatever you're about to eat.",
    type: "daily",
    timeLimitSeconds: null,
    difficulty: "easy",
    tags: ["food"],
  },
  {
    id: "daily_desk",
    promptText: "show off your workspace, mess and all.",
    type: "daily",
    timeLimitSeconds: null,
    difficulty: "easy",
    tags: ["home", "work"],
  },
  {
    id: "daily_sky",
    promptText: "point up and snap the sky.",
    type: "daily",
    timeLimitSeconds: null,
    difficulty: "easy",
    tags: ["outdoors"],
  },
  {
    id: "daily_selfie_mood",
    promptText: "a selfie that captures today's mood.",
    type: "daily",
    timeLimitSeconds: null,
    difficulty: "medium",
    tags: ["self"],
  },
  {
    id: "daily_hidden_gem",
    promptText: "find something in your home you forgot you owned.",
    type: "daily",
    timeLimitSeconds: null,
    difficulty: "medium",
    tags: ["home"],
  },
  {
    id: "daily_view",
    promptText: "snap the view from wherever you are right now.",
    type: "daily",
    timeLimitSeconds: null,
    difficulty: "easy",
    tags: ["outdoors"],
  },

  // time_sensitive — timeLimitSeconds is required
  {
    id: "timed_round_object",
    promptText: "find something round in 60 seconds.",
    type: "time_sensitive",
    timeLimitSeconds: 60,
    difficulty: "medium",
    tags: ["shape", "speed"],
  },
  {
    id: "timed_blue_item",
    promptText: "grab something blue in 45 seconds.",
    type: "time_sensitive",
    timeLimitSeconds: 45,
    difficulty: "medium",
    tags: ["colour", "speed"],
  },
  {
    id: "timed_weird_face",
    promptText: "pull your weirdest face in 30 seconds.",
    type: "time_sensitive",
    timeLimitSeconds: 30,
    difficulty: "easy",
    tags: ["self", "speed"],
  },
  {
    id: "timed_kitchen_dash",
    promptText: "sprint to your kitchen and snap the first thing you see, 60 seconds.",
    type: "time_sensitive",
    timeLimitSeconds: 60,
    difficulty: "hard",
    tags: ["speed", "home"],
  },
  {
    id: "timed_pair_up",
    promptText: "find two things that match in 90 seconds.",
    type: "time_sensitive",
    timeLimitSeconds: 90,
    difficulty: "medium",
    tags: ["speed"],
  },
  {
    id: "timed_outside_dash",
    promptText: "step outside and snap the nearest thing, 40 seconds.",
    type: "time_sensitive",
    timeLimitSeconds: 40,
    difficulty: "hard",
    tags: ["outdoors", "speed"],
  },
];

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
