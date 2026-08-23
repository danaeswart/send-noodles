import type { PromptDoc } from "../types";

// Time-sensitive prompt bank — each entry needs timeLimitSeconds so
// startTimeSensitiveChallenge (firebase/challenges.ts) knows how long
// the window is; the UI should hide/close the prompt screen once that
// window elapses. Combined with daily.ts in seed.ts to form the full
// prompt bank written to /prompts. Hand-edit this list to add/tweak
// time-sensitive prompts; ids must stay stable and unique since they're
// used as Firestore doc ids.
export const TIME_SENSITIVE_PROMPTS: (PromptDoc & { id: string })[] = [
  // 30 seconds
  { id: "timed_30s_01", promptText: "Quick! You've only got 30 seconds to snap something green.", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_02", promptText: "Go! You've got 30 seconds to find something that makes you smile.", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_03", promptText: "Quick! Can you find something perfectly round before time runs out?", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_04", promptText: "You've got 30 seconds. Snap the most interesting thing within reach!", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_05", promptText: "Ready, set, snap! Find a pattern in 30 seconds.", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_06", promptText: "Quick! You've got 30 seconds to find something yellow.", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_07", promptText: "Can you spot a face in 30 seconds? Go!", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_08", promptText: "30 seconds! Capture something you normally wouldn't notice.", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_09", promptText: "Quick! Find something smaller than your hand.", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_10", promptText: "You've got 30 seconds to snap something that's moving.", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_11", promptText: "Go! Find something with three different colours.", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_12", promptText: "Quick! Find an interesting shadow before the clock runs out.", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_13", promptText: "30 seconds. Find something starting with the letter S!", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_14", promptText: "Quick! Spot something completely out of place.", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },
  { id: "timed_30s_15", promptText: "You've got 30 seconds. Take the most unexpectedly interesting photo you can.", type: "time_sensitive", timeLimitSeconds: 30, difficulty: "medium", tags: [] },

  // 60 seconds
  { id: "timed_60s_01", promptText: "Quick! You've got 1 minute to find something green AND square.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_02", promptText: "Ready? You've got 1 minute to find something red AND round.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_03", promptText: "Go! Find something that looks like an animal before time runs out.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_04", promptText: "You've got 1 minute. Can you find two things that match?", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_05", promptText: "Quick! Find something older than you.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_06", promptText: "You've got 1 minute to capture something beautiful you almost missed.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_07", promptText: "Quick! Find something with a reflection.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_08", promptText: "You've got 1 minute to find the most interesting texture around you.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_09", promptText: "Go! Photograph something from a completely unexpected angle.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_10", promptText: "You've got 60 seconds. Find the brightest thing around you!", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_11", promptText: "Quick! Find the smallest interesting thing you can.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_12", promptText: "You've got 1 minute to capture something that tells a story.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_13", promptText: "Can you find something shaped like a letter in 60 seconds?", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_14", promptText: "Quick! Find something that makes you laugh.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_15", promptText: "You've got 1 minute. Find something that doesn't belong.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_16", promptText: "Go! Find something you've never photographed before.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_17", promptText: "You've got 60 seconds to find the most interesting thing within 10 steps.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_18", promptText: "Quick! Find a repeating pattern.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_19", promptText: "You've got 1 minute. Capture something without photographing it head-on.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },
  { id: "timed_60s_20", promptText: "Go! Find something that looks completely different up close.", type: "time_sensitive", timeLimitSeconds: 60, difficulty: "medium", tags: [] },

  // 120 seconds (2 minutes)
  { id: "timed_120s_01", promptText: "Quick! You've got 2 minutes to find the newest-looking thing around you.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_02", promptText: "You've got 2 minutes. Find the oldest-looking thing you can spot.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_03", promptText: "Sweet! You've got 2 minutes to find something that looks delicious.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_04", promptText: "Go wild! You've got 2 minutes to find something unexpected.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_05", promptText: "You've got 2 minutes to find three things hiding in the same colour.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_06", promptText: "Quick! Find something starting with the same letter as your name.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_07", promptText: "You've got 2 minutes to find something that looks expensive.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_08", promptText: "Quick! Find something ordinary and make it look extraordinary.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_09", promptText: "You've got 2 minutes. Can you find something hiding in plain sight?", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_10", promptText: "Quick! Find something with a shadow worth snapping.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_11", promptText: "You've got 2 minutes to find something that reflects you.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_12", promptText: "Go! Find the most interesting texture you can.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_13", promptText: "You've got 2 minutes to find something that looks like a tiny version of something else.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_14", promptText: "Quick! Find something that doesn't match its surroundings.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_15", promptText: "You've got 2 minutes. Find something that makes you think of summer.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_16", promptText: "Quick! Find something that reminds you of home.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_17", promptText: "You've got 2 minutes to find something completely random.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_18", promptText: "Go! Find three different shapes in one scene.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_19", promptText: "You've got 2 minutes. Find something beautiful that most people would ignore.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },
  { id: "timed_120s_20", promptText: "Quick! Find something that looks completely different when you change your position.", type: "time_sensitive", timeLimitSeconds: 120, difficulty: "medium", tags: [] },

  // 300 seconds (5 minutes)
  { id: "timed_300s_01", promptText: "Ready? You've got 5 minutes to find five different colours.", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_02", promptText: "You've got 5 minutes. Can you find a circle, a square AND a triangle?", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_03", promptText: "Go! Find three things that make you happy.", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_04", promptText: "You've got 5 minutes to hunt down three interesting textures.", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_05", promptText: "Quick! Find something tiny, something huge and something in between.", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_06", promptText: "You've got 5 minutes. Find three things that absolutely don't belong together.", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_07", promptText: "Go! Find three things that could tell a story together.", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_08", promptText: "You've got 5 minutes. Capture the same place from three different perspectives.", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_09", promptText: "Quick! Find three unexpected things.", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_10", promptText: "You've got 5 minutes to find something old, something new and something that looks borrowed.", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_11", promptText: "Go! Find three completely different things that share the same colour.", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_12", promptText: "You've got 5 minutes. Can you create a photo with three different patterns?", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_13", promptText: "Quick! Find the most interesting corner around you.", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_14", promptText: "You've got 5 minutes to spot three things you'd normally walk straight past.", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
  { id: "timed_300s_15", promptText: "Go! Capture three tiny moments from wherever you are.", type: "time_sensitive", timeLimitSeconds: 300, difficulty: "medium", tags: [] },
];
