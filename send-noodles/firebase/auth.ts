import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
  type User,
} from "@firebase/auth";
import { collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";

import { auth, firestore } from "./firebaseConfig";
import { leaveCircle } from "./circles";
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

// The three fields the profile page's "no-no zone" account settings
// let a user edit. Each updates both the Firebase Auth account (the
// source of truth for sign-in) and the mirrored field on the user's
// Firestore profile doc (what the rest of the app — display names
// shown across circles, etc. — actually reads), so the two never drift
// apart. Auth's email/password updates require a recent sign-in; a
// stale session surfaces as auth/requires-recent-login, which the
// caller should handle by asking the user to sign in again and retry.
export async function updateDisplayName(userId: string, displayName: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("No signed-in user.");
  const trimmed = displayName.trim();
  if (!trimmed) throw new Error("Display name can't be empty.");

  await updateProfile(user, { displayName: trimmed });
  await updateDoc(doc(firestore, "users", userId), { displayName: trimmed });
}

export async function updateEmailAddress(userId: string, email: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("No signed-in user.");
  const trimmed = email.trim();
  if (!trimmed) throw new Error("Email can't be empty.");

  await updateEmail(user, trimmed);
  await updateDoc(doc(firestore, "users", userId), { email: trimmed });
}

export async function updateAccountPassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("No signed-in user.");
  if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");

  await updatePassword(user, newPassword);
}

// Leaves every circle the user belongs to, then wipes their personal
// snap archive and profile doc. Deliberately stops short of deleting
// the Firebase Auth account itself (see finalizeAccountDeletion below)
// so the caller can show a "your account has been deleted" message
// while the user is still signed in, instead of that message racing
// the auth-state change that immediately boots them to the login screen.
export async function deleteAccountData(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("No signed-in user.");
  const userId = user.uid;

  const circlesSnap = await getDocs(query(collection(firestore, "circles"), where("members", "array-contains", userId)));
  for (const circleDoc of circlesSnap.docs) {
    await leaveCircle(circleDoc.id, userId);
  }

  const snapsSnap = await getDocs(collection(firestore, "users", userId, "snaps"));
  const batch = writeBatch(firestore);
  snapsSnap.docs.forEach((snapDoc) => batch.delete(snapDoc.ref));
  batch.delete(doc(firestore, "users", userId));
  await batch.commit();
}

// The actual last step of account deletion — called once the caller is
// done showing its "deleted" confirmation. Deletes the Firebase Auth
// account, which signs the user out; RootNavigator's auth-state switch
// then takes it from there and lands them on the login screen. Firebase
// requires a recent sign-in for this; a stale session surfaces as
// auth/requires-recent-login, which the caller should handle by asking
// the user to sign in again before retrying.
export async function finalizeAccountDeletion(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("No signed-in user.");
  await deleteUser(user);
}

export function subscribeToAuthUser(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUserId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No signed-in user.");
  return uid;
}
