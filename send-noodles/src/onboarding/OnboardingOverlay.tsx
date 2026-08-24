import { useOnboarding } from "./OnboardingContext";
import { ONBOARDING_STEPS, STEP_COUNT } from "./steps";
import PopupCard from "./components/PopupCard";

// The whole tour is five of these popups, one per pager panel, in a
// fixed loop the overlay itself drives (see OnboardingContext.advance,
// which requests the next panel jump) — it never needs to know which
// real screen is mounted underneath beyond that.
export default function OnboardingOverlay() {
  const onboarding = useOnboarding();

  if (!onboarding.active) return null;

  const step = ONBOARDING_STEPS[onboarding.stepIndex];
  const isLastStep = onboarding.stepIndex === STEP_COUNT - 1;

  return (
    <PopupCard
      title={step.title}
      body={step.body}
      stepIndex={onboarding.stepIndex}
      stepCount={STEP_COUNT}
      isLastStep={isLastStep}
      onNext={() => onboarding.advance()}
      onSkip={() => onboarding.skip()}
    />
  );
}
