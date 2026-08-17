import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'lifeos-profile-v1';

const defaultProfile = {
  name: '',
  age: null,
  photo: null,
  completed: false,
};

export function useProfile() {
  const [profile, setProfile] = useLocalStorage(STORAGE_KEY, () => defaultProfile);

  function updateProfile(patch) {
    setProfile((prev) => ({ ...prev, ...patch }));
  }

  function completeProfile(patch) {
    setProfile((prev) => ({ ...prev, ...patch, completed: true }));
  }

  return {
    profile: profile ?? defaultProfile,
    updateProfile,
    completeProfile,
  };
}
