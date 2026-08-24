import type { OnboardingStep, OnboardingStepId } from "./types";

// The whole tour, in order. Purely presentational — copy and order live
// here so they're easy to change without touching OnboardingOverlay or
// any real screen. Each step names the pager panel it belongs to (see
// SwipeNavigator); the overlay jumps the deck there itself before
// showing that step's popup, so this doesn't rely on the user swiping.
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "profile",
    panelIndex: 4,
    title: "Your Profile",
    body: "This is your profile page. All your account details live here — set your avatar and see the frames you've unlocked.",
  },
  {
    id: "snap",
    panelIndex: 3,
    title: "Snap",
    body: "This is your snap page. Take a photo here and send it to your group.",
  },
  {
    id: "home",
    panelIndex: 2,
    title: "Challenges",
    body: "This is your home page. You'll see the daily challenges for each of your circles here.",
  },
  {
    id: "circles",
    panelIndex: 1,
    title: "Circles",
    body: "This is your circles page — all your friend groups live here, and snaps you share land in your circle.",
  },
  {
    id: "gallery",
    panelIndex: 0,
    title: "Gallery Wall",
    body: "This is your personal gallery wall. Only you can see it — decorate it however you like.",
  },
];

const STEP_BY_ID = new Map(ONBOARDING_STEPS.map((s) => [s.id, s]));

export function getStep(id: OnboardingStepId): OnboardingStep {
  const step = STEP_BY_ID.get(id);
  if (!step) throw new Error(`Unknown onboarding step: ${id}`);
  return step;
}

export const FIRST_STEP_ID: OnboardingStepId = ONBOARDING_STEPS[0].id;
export const STEP_COUNT = ONBOARDING_STEPS.length;
