// The one standing "challenge" shown on every user's personal "Me,
// Myself & I" circle — same text for every account, every day. Unlike a
// real ChallengeDoc (see firebase/challenges.ts), this never lives in
// Firestore: there's no wager, team, or scoring to track for it, so
// PersonalCircleScreen and useHomeChallenges both just read this
// constant directly instead of subscribing to anything.
export const PERSONAL_CIRCLE_CHALLENGE_TEXT = "Give extra marks to one person today";
