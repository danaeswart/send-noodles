import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

import type { OnboardingStepId } from "./types";
import { ONBOARDING_STEPS } from "./steps";

type OnboardingContextValue = {
  active: boolean;
  stepIndex: number;
  stepId: OnboardingStepId;

  // Begins (or restarts, for a Help replay) the tour from the first
  // step. The only two call sites are SignUpScreen — right after a
  // brand-new account is created — and the Help row on the profile
  // page's settings; nothing persists this, and nothing checks for it
  // automatically on sign-in, so an ordinary login never shows it.
  start: () => void;
  // Advances to the next step, or ends the tour if this was the last one.
  advance: () => void;
  // Ends the tour early, same effect as reaching the end.
  skip: () => void;

  // Set by SwipeNavigator's own effect once it has honored a jump — the
  // tour drives every panel change itself (this isn't gesture-driven),
  // so every step transition goes through this.
  panelJumpRequest: number | null;
  requestPanelJump: (index: number) => void;
  clearPanelJumpRequest: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [panelJumpRequest, setPanelJumpRequest] = useState<number | null>(null);

  const start = useCallback(() => {
    setStepIndex(0);
    setActive(true);
    setPanelJumpRequest(ONBOARDING_STEPS[0].panelIndex);
  }, []);

  const skip = useCallback(() => setActive(false), []);

  const advance = useCallback(() => {
    setStepIndex((current) => {
      const next = current + 1;
      if (next >= ONBOARDING_STEPS.length) {
        setActive(false);
        return current;
      }
      setPanelJumpRequest(ONBOARDING_STEPS[next].panelIndex);
      return next;
    });
  }, []);

  const requestPanelJump = useCallback((index: number) => setPanelJumpRequest(index), []);
  const clearPanelJumpRequest = useCallback(() => setPanelJumpRequest(null), []);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      active,
      stepIndex,
      stepId: ONBOARDING_STEPS[stepIndex].id,
      start,
      advance,
      skip,
      panelJumpRequest,
      requestPanelJump,
      clearPanelJumpRequest,
    }),
    [active, stepIndex, panelJumpRequest, start, advance, skip, requestPanelJump, clearPanelJumpRequest]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within an OnboardingProvider");
  return ctx;
}
