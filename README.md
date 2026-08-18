
 ![Send Noodles banner](/send-noodles/readme-assets/noodle.png)

# Send Noodles

A social app for small friend groups, called “circles”, designed to pull you out of the constant noise and into the moment. Daily challenges give you a reason to pause, be present, and experience something with your friends. Snap a photo, share the moment, challenge your friends, and build your shared gallery wall together.

Complete challenges to unlock frames, send noodles, collect memories, and discover more ways to connect. It is about taking a moment away from everything trying to get your attention and actually being there for it.



##  Features

- **Circles** - create or join a friend group with an invite code, see members and a points scoreboard.
- **Challenges** - a new challenge is proposed and agreed on by the circle, with a countdown timer until it's due.
- **Snap & Send** - take a photo (front or back camera, shake-to-flip supported), caption it, and send it to your circle.
- **Gallery Wall** - sent snaps land on a wall of framed polaroids that can be rearranged/dragged.
- **Profile** - avatar picker, frame/style swatches, and personal stats (streaks, wins, points).
- **Auth** - email/password sign up and login, persisted between app launches.

<!-- 
  📸 ADD IMAGES HERE: a row of screenshots for key screens
  Example:
  <p float="left">
    <img src="./assets/readme/circles.png" width="200" />
    <img src="./assets/readme/snap.png" width="200" />
    <img src="./assets/readme/gallery.png" width="200" />
  </p>
-->

##  Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) ~54 / [React Native](https://reactnative.dev) 0.81 |
| Language | TypeScript |
| UI | React 19, custom components (no UI kit) |
| Navigation | [React Navigation](https://reactnavigation.org) (native stack) |
| Animations & Gestures | react-native-reanimated, react-native-gesture-handler, react-native-worklets |
| Backend / Database | [Firebase](https://firebase.google.com) — Authentication + Firestore |
| Image hosting | [Cloudinary](https://cloudinary.com) (unsigned uploads) — Firestore only stores the resulting URL, since Firebase Storage requires a paid plan |
| Camera / Sensors | expo-camera, expo-sensors (shake detection), expo-image-manipulator, expo-haptics |
| Storage | @react-native-async-storage/async-storage (auth session persistence) |

##  Project Structure

```
send-noodles/
├── App.tsx                # App root (gesture handler, safe area, navigation)
├── index.ts                # Expo entry point
├── firebase/                # Firebase config, auth, and Firestore data access (circles, challenges, snaps, users)
├── cloudinary/               # Cloudinary config and upload helper
├── firestore.rules            # Firestore security rules
├── src/
│   ├── screens/               # Top-level screens (Circles, Snap, Gallery Wall, Profile, Auth, ...)
│   ├── components/              # Reusable UI, grouped by feature (auth/, circles/, snap/, profile/, ...)
│   ├── navigation/              # React Navigation stack + types
│   ├── hooks/                # Data-fetching and device hooks (useCircle, useShakeDetector, ...)
│   ├── constants/              # Theme, frames, avatar faces
│   ├── data/                 # Mock data used before/alongside live Firebase data
│   └── utils/                # Shared helper functions
└── assets/                  # Images, frames, illustrations
```

##  Prerequisites

- [Node.js](https://nodejs.org) 20+ (this project was built against Node 22)
- npm (comes with Node)
- The [Expo Go](https://expo.dev/go) app on your phone (easiest way to run it), **or** Android Studio / Xcode set up for a simulator
- A Firebase project and a Cloudinary account if you want your own backend (see [Backend Setup](#-backend-setup) below) — the repo currently ships with a working shared project's config, so this is optional to get started

##  Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the Expo dev server
 npx expo start 
```


Then either:
- Scan the QR code with the **Expo Go** app on your phone, or
- Press `a` for Android emulator, `i` for iOS simulator, or `w` for web (in the terminal running the dev server)

### Other scripts

```bash
npm run android   # start and open on a connected Android device/emulator
npm run ios       # start and open on an iOS simulator (macOS only)
npm run web       # start and open in a browser
```

## Backend Setup

This app uses **Firebase** (Auth + Firestore) and **Cloudinary** (image hosting). To point the app at your own backend instead of the default configured project:

1. **Firebase**
   - Create a project at the [Firebase console](https://console.firebase.google.com).
   - Enable **Authentication → Email/Password**.
   - Create a **Firestore** database.
   - Copy your web app config into [`firebase/firebaseConfig.ts`](./firebase/firebaseConfig.ts).
   - Deploy the security rules in [`firestore.rules`](./firestore.rules) via `firebase deploy --only firestore:rules` (requires the [Firebase CLI](https://firebase.google.com/docs/cli)).


2. **Cloudinary**
   - Create an account at [cloudinary.com](https://cloudinary.com).
   - Add an **unsigned upload preset** under Settings → Upload → Upload presets.
   - Set your cloud name and preset in [`cloudinary/config.ts`](./cloudinary/config.ts).

##  Key Concepts

- **Circle** - a small group of friends, joined via an invite code, that shares challenges and a scoreboard.
- **Challenge** - a task the circle agrees to do; has a due-by countdown and a set prize, like "buying drinks at the end of the week".
- **Snap** - a photo submitted for a challenge, stored on Cloudinary with its URL saved in Firestore under the circle.

##  Notes

- Written against **Expo SDK 54** — since Expo's API changes frequently between major versions, check the [versioned docs](https://docs.expo.dev/versions/v54.0.0/) if something doesn't match what you'd expect from older tutorials.
- Native `ios/` and `android/` folders are not checked in (Expo managed workflow) — they're generated on demand via `expo prebuild` if you ever need to eject.

<!-- 
  📸 ADD AN IMAGE HERE if you'd like a footer/closing image, e.g. the app icon
-->
