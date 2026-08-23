import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'lifeos-friends-v1';

/*
  Friend list is a local-only mock: an array of the handles this device
  has marked as a friend, persisted the same way every other lifeos-*
  key is. There is no auth or friend-graph backend yet, so "friend" here
  just means "this browser opted in" -- see isFriend below, the one
  place that decision gets made, so a real backend swap only touches
  this file.
*/
export function useFriends() {
  const [friendHandles, setFriendHandles] = useLocalStorage(STORAGE_KEY, () => []);

  function toggleFriend(handle) {
    setFriendHandles((prev) =>
      prev.includes(handle) ? prev.filter((existing) => existing !== handle) : [...prev, handle],
    );
  }

  // TODO: replace with backend friend graph
  function isFriend(handle) {
    return friendHandles.includes(handle);
  }

  return { friendHandles, toggleFriend, isFriend };
}
