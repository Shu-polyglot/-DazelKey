import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'lifeos-onboarding-v1';

export function useOnboarding() {
  const [state, setState] = useLocalStorage(STORAGE_KEY, () => ({ completed: false, age: null }));

  function completeOnboarding(age) {
    setState({ completed: true, age });
  }

  return {
    isOnboarded: Boolean(state?.completed),
    age: state?.age ?? null,
    completeOnboarding,
  };
}
