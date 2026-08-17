import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";

import { firestore } from "./firebaseConfig";
import type { PromptDoc, PromptType, WithId } from "./types";

// Writes a prompt under a specific, human-readable doc id (e.g.
// "daily_green") instead of an auto-generated one, so the prompt bank
// in seed.ts stays legible in the Firebase console. Skips the write if
// a prompt with that id already exists: firestore.rules allows create
// on /prompts but not update, so re-seeding after adding new entries to
// the bank must not attempt to rewrite ones that already landed.
export async function createPromptWithId(id: string, prompt: PromptDoc): Promise<"created" | "skipped"> {
  const ref = doc(firestore, "prompts", id);
  const existing = await getDoc(ref);
  if (existing.exists()) return "skipped";
  await setDoc(ref, prompt);
  return "created";
}

// Firestore has no "not in this (possibly long) array" query, so this
// fetches every prompt of the given type — fine for the small,
// hand-curated prompt bank this app expects — and filters/picks
// client-side. Returns null once every prompt of that type has been
// used by the circle.
export async function fetchRandomUnusedPrompt(
  type: PromptType,
  usedPrompts: string[]
): Promise<WithId<PromptDoc> | null> {
  const q = query(collection(firestore, "prompts"), where("type", "==", type));
  const snapshot = await getDocs(q);
  const candidates = snapshot.docs
    .map((d) => ({ id: d.id, ...(d.data() as PromptDoc) }))
    .filter((prompt) => !usedPrompts.includes(prompt.id));

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
