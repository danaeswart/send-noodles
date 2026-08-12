// @firebase/auth's package.json "exports" map lists a blanket top-level
// "types" condition ahead of its "react-native" condition, so TypeScript
// (which always matches "types" first, regardless of customConditions)
// resolves declarations from the generic/browser build and never sees
// getReactNativePersistence — even though Metro correctly resolves the
// real React Native build at runtime. This augments the module's types
// to match what's actually exported on device. See:
// node_modules/@firebase/auth/dist/rn/index.rn.d.ts
//
// The `export {}` below is required so TS treats this file as a module
// (not a global script) — only then does the `declare module` block
// below perform augmentation (adding to the real module's exports)
// instead of replacing them outright.
export {};

declare module "@firebase/auth" {
  interface AsyncStorageLike {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }

  export function getReactNativePersistence(storage: AsyncStorageLike): Persistence;
}
