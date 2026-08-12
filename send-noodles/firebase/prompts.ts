import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

import { firestore } from "./firebaseConfig";
import type { PromptDoc, PromptType, WithId } from "./types";

export async function createPrompt(prompt: PromptDoc): Promise<string> {
  const ref = await addDoc(collection(firestore, "prompts"), prompt);
  return ref.id;
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
