import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'lifeos-onboarding-complete-v1';

/*
  Whether the first-run tutorial (see Onboarding/OnboardingTutorial) has
  ever been finished or skipped -- once true, App never shows it again
  unattended. Replaying it from the profile panel does not touch this
  flag (see ProfilePanel's "Replay Tutorial"): that's a deliberate re-view,
  not a reset of the first-run state.
*/
export function useOnboardingTutorial() {
  const [hasSeenTutorial, setHasSeenTutorial] = useLocalStorage(STORAGE_KEY, () => false);

  function markTutorialSeen() {
    setHasSeenTutorial(true);
  }

  return { hasSeenTutorial, markTutorialSeen };
}
