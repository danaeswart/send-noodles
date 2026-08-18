import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "@firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, firestore } from "./firebaseConfig";
import type { UserProfile } from "./types";

export async function signUpWithEmail(email: string, password: string, firstName: string, surname: string) {
  const displayName = [firstName, surname].filter(Boolean).join(" ").trim() || email;
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  const profile: Omit<UserProfile, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    firstName,
    surname,
    displayName,
    email,
    avatarUrl: null,
    avatarId: null,
    stats: { challengesCompleted: 0, streak: 0, totalSnaps: 0 },
    unlockedFrames: [],
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(firestore, "users", credential.user.uid), profile);

  return credential.user;
}

export async function logInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logOut() {
  await signOut(auth);
}

export function subscribeToAuthUser(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUserId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No signed-in user.");
  return uid;
}
