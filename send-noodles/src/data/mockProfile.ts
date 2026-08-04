export interface UnlockedFrame {
  id: string;
  color: string;
}

export interface RecentWin {
  id: string;
  title: string;
  context: string;
  accentColor: string;
}

export interface SettingsField {
  id: string;
  label: string;
  value: string;
  masked?: boolean;
}

export interface PreferenceToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

// TEMP mock data. Swap for a live Firestore read on the current user's
// doc once the backend exists — every component here takes these shapes
// as props, so the swap should be additive rather than a rewrite.
export const mockProfile = {
  username: "alex.l",
  streakDays: 24,
  points: 3560,
  snaps: 214,
  circles: 5,
  // Left undefined for now — Avatar renders a placeholder until you
  // drop a real asset in and pass require("../../assets/...") here.
  avatarSource: undefined as number | undefined,
  unlockedFrames: [
    { id: "f1", color: "#6C63FF" },
    { id: "f2", color: "#2F5233" },
    { id: "f3", color: "#D9A62E" },
    { id: "f4", color: "#C1443C" },
    { id: "f5", color: "#1A1A1A" },
    { id: "f6", color: "#C9B79C" },
    { id: "f7", color: "#B8563A" },
  ] as UnlockedFrame[],
  recentWins: [
    { id: "w1", title: "most creative", context: "uni degenerates \u00b7 yesterday", accentColor: "#6C63FF" },
    { id: "w2", title: "first to submit", context: "family chaos \u00b7 last week", accentColor: "#D9A62E" },
    { id: "w3", title: "crowd favourite", context: "work lunch crew \u00b7 last week", accentColor: "#2F5233" },
  ] as RecentWin[],
  settings: {
    account: [
      { id: "s1", label: "Username", value: "jess_m" },
      { id: "s2", label: "Email", value: "jess@example.com" },
      { id: "s3", label: "Password", value: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", masked: true },
      { id: "s4", label: "Phone", value: "+44 7700 900123" },
    ] as SettingsField[],
    displayName: { id: "s5", label: "Display Name", value: "Jessica M." } as SettingsField,
    avatarStyleCount: 5,
    preferences: [
      {
        id: "p1",
        label: "Challenge notifications",
        description: "remind me before a challenge ends",
        enabled: true,
      },
      {
        id: "p2",
        label: "Public profile",
        description: "let others see your snaps",
        enabled: true,
      },
      {
        id: "p3",
        label: "Dark frames",
        description: "unlocked frame borders in dark ink",
        enabled: false,
      },
    ] as PreferenceToggle[],
  },
};
