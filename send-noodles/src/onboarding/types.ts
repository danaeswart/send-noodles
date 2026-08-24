// The 5-panel tour is a fixed loop over SwipeNavigator's own deck
// (Gallery=0, Circles=1, Home=2, Snap=3, Profile=4) — one popup per
// panel, in the order a first-time user should meet them.
export type OnboardingStepId = "profile" | "snap" | "home" | "circles" | "gallery";

export type OnboardingStep = {
  id: OnboardingStepId;
  // Which SwipeNavigator pager index this step's popup belongs to.
  panelIndex: number;
  title: string;
  body: string;
};
