// This file sets up the app's one connection to Firebase and hands out
// the two pieces the rest of the app needs: `auth` (sign up/log in) and
// `firestore` (the database). Snap photos are NOT stored here — Cloud
// Storage for Firebase requires the paid Blaze plan, so images upload
// to Cloudinary instead (see cloudinary/upload.ts); only each snap's
// resulting Cloudinary URL is written to Firestore.
// Every other file that needs Firebase imports from HERE rather than
// creating its own connection — see firebase/auth.ts for an example
// that imports `auth` from this file to implement logInWithEmail etc.

import { initializeApp, getApps, getApp } from "firebase/app";

// NOTE: imported from "@firebase/auth" (not the "firebase/auth" wrapper).
// The installed firebase@12 wrapper package's "./auth" export map has no
// "react-native" condition, so "firebase/auth" always resolves to the
// browser build — which has no getReactNativePersistence and silently
// falls back to in-memory (non-persistent) auth on device. "@firebase/auth"
// is the underlying package "firebase" re-exports from, and its own export
// map does have the correct React Native build.
import { initializeAuth, getAuth, getReactNativePersistence, type Auth } from "@firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase project: "noodles".
// These values identify which Firebase project this app talks to. They
// are NOT secret (they're baked into every client build and are safe to
// commit) — access control is enforced server-side by Firestore
// security rules, not by hiding this object. Get these values from the
// Firebase console: Project settings (gear icon) > General > Your apps
// > SDK setup and configuration > Config.
const firebaseConfig = {
   apiKey: "AIzaSyBQ6lXe18ZpTTPM3uWotqzaA6BesZt82Sw",
  authDomain: "noodles-7b33b.firebaseapp.com",
  projectId: "noodles-7b33b",
  storageBucket: "noodles-7b33b.firebasestorage.app",
  messagingSenderId: "699152441164",
  appId: "1:699152441164:web:2b41297dcf90b38b27b9e9"
};

// initializeApp() opens the connection to that Firebase project — it
// must only be called once per app run. React Native's Fast Refresh
// re-executes this module on every hot reload during development, which
// would call initializeApp() again and crash with "app already exists".
// getApps() lists any apps already initialized; if one exists, reuse it
// via getApp() instead of creating a second one.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth() sets up the auth SDK for this app AND configures how
// login sessions are remembered between app launches. Passing
// getReactNativePersistence(AsyncStorage) tells it to save the signed-in
// session to on-device storage, so a user who logs in once stays logged
// in after closing and reopening the app (see the loading/user check in
// RootNavigator.tsx, which reads this session on startup).
//
// Like initializeApp(), initializeAuth() throws if called more than once
// against the same app (e.g. on Fast Refresh reloading this module) — if
// that happens, fall back to getAuth(), which just fetches the auth
// instance that was already set up, instead of crashing.
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

// firestore: the NoSQL database — circles, challenges, snaps, profiles.
const firestore = getFirestore(app);

// Exported for other files to import instead of repeating this setup.
export { app, auth, firestore };
