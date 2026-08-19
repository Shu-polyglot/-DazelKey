import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { normalizeProfile } from '../lib/profile';

const STORAGE_KEY = 'lifeos-profile-v1';

const defaultProfile = {
  name: '',
  age: null,
  photo: null,
  bio: '',
  role: '',
  socialLinks: [],
  completed: false,
};

export function useProfile() {
  const [storedProfile, setStoredProfile] = useLocalStorage(STORAGE_KEY, () => defaultProfile);

  const profile = useMemo(() => normalizeProfile(storedProfile ?? defaultProfile), [storedProfile]);

  function updateProfile(patch) {
    setStoredProfile((prev) => ({ ...normalizeProfile(prev ?? defaultProfile), ...patch }));
  }

  function completeProfile(patch) {
    setStoredProfile((prev) => ({ ...normalizeProfile(prev ?? defaultProfile), ...patch, completed: true }));
  }

  return {
    profile,
    updateProfile,
    completeProfile,
  };
}
