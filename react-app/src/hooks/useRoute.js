import { useEffect, useState } from 'react';

// Timeline no longer has its own tab -- it now lives at the top of the
// Achievement tab -- so it's not a navigable route, but old #/timeline
// hashes are still recognized below and mapped onto 'achievement'.
export const ROUTES = ['story', 'achievement', 'bucket-lists', 'explore', 'profile'];
const DEFAULT_ROUTE = 'bucket-lists';

// Recognizes both the tab hashes this router owns (#/story, #/achievement...)
// and the pre-existing Copy Link format from ShareModal (#achievement-<id>),
// which predates tab navigation and must keep landing on the Achievement tab.
function readRouteFromHash(hash) {
  const tabMatch = hash.match(/^#\/(story|achievement|bucket-lists|explore|profile|timeline)\b/);
  if (tabMatch) {
    return tabMatch[1] === 'timeline' ? 'achievement' : tabMatch[1];
  }
  if (/^#achievement-/.test(hash)) {
    return 'achievement';
  }
  return null;
}

export function useRoute() {
  const [route, setRoute] = useState(() => readRouteFromHash(window.location.hash) || DEFAULT_ROUTE);

  useEffect(() => {
    function handleHashChange() {
      const next = readRouteFromHash(window.location.hash);
      if (next) {
        setRoute(next);
      }
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function navigate(nextRoute) {
    if (!ROUTES.includes(nextRoute) || nextRoute === route) {
      return;
    }
    window.location.hash = `/${nextRoute}`;
  }

  return [route, navigate];
}
