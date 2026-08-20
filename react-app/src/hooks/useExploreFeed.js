import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { exploreFeedSeed } from '../data/exploreFeed';

const STORAGE_KEY = 'lifeos-explore-inspired-v1';

/*
  Feed data is seeded locally for now, but shaped as a fetch-then-render
  hook (not a plain import) so swapping the seed for a real API call later
  only touches this file -- every caller keeps reading `{ feed, ... }`.
  Only the current user's own "Inspired" toggles are real, persisted state;
  everything else about a post comes straight from the seed.
*/
export function useExploreFeed() {
  const [inspiredIds, setInspiredIds] = useLocalStorage(STORAGE_KEY, () => []);

  const feed = useMemo(
    () =>
      exploreFeedSeed.map((post) => {
        const isInspired = inspiredIds.includes(post.id);
        return {
          ...post,
          isInspired,
          inspiredCount: post.inspiredCount + (isInspired ? 1 : 0),
        };
      }),
    [inspiredIds],
  );

  function toggleInspired(id) {
    setInspiredIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
  }

  return { feed, toggleInspired };
}
