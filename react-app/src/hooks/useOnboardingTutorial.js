import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'dazelkey-onboarding-complete-v1';
const LEGACY_STORAGE_KEY = 'lifeos-onboarding-complete-v1';

/*
  Whether the first-run tutorial (see Onboarding/OnboardingTutorial) has
  ever been finished or skipped -- once true, App never shows it again
  unattended. Replaying it from About DazelKey does not touch this flag
  (see AboutManifesto's "Replay Tutorial"): that's a deliberate re-view,
  not a reset of the first-run state.
*/
export function useOnboardingTutorial() {
  const [hasSeenTutorial, setHasSeenTutorial] = useLocalStorage(STORAGE_KEY, () => false, LEGACY_STORAGE_KEY);

  function markTutorialSeen() {
    setHasSeenTutorial(true);
  }

  return { hasSeenTutorial, markTutorialSeen };
}
