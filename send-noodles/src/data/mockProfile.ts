export interface PreferenceToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

// TEMP mock data — the profile page's identity/stats/frames/avatar are
// now backed by Firestore (see useUserProfile), but these toggles don't
// persist anywhere yet.
export const mockProfile = {
  settings: {
    preferences: [
      {
        id: "p1",
        label: "Challenge notifications",
        description: "remind me before a challenge ends",
        enabled: true,
      },
    ] as PreferenceToggle[],
  },
};
