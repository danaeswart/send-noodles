// Daily challenges have no per-challenge Firestore endsAt (only
// time_sensitive prompts ever set timeline.endsAt) — every circle's
// daily prompt runs on the same wall-clock cycle regardless of when it
// happened to be proposed, resetting at noon and always closing out at
// midnight. So the countdown shown on Home is always "time left until
// midnight tonight" rather than anything read off the challenge doc.
export function nextMidnightISOString(from: Date = new Date()): string {
  const next = new Date(from);
  next.setHours(24, 0, 0, 0);
  return next.toISOString();
}
