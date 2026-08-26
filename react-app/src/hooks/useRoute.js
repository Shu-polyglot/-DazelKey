import { useEffect, useState } from 'react';

// Timeline no longer has its own tab -- it now lives at the top of the
// Achievement tab -- so it's not a navigable route, but old #/timeline
// hashes are still recognized below and mapped onto 'achievement'.
export const ROUTES = ['story', 'achievement', 'explore', 'strategy', 'profile'];
const DEFAULT_ROUTE = 'strategy';

// Recognizes both the tab hashes this router owns (#/story, #/achievement...)
// and the pre-existing Copy Link format from ShareModal (#achievement-<id>),
// which predates tab navigation and must keep landing on the Achievement tab.
// 'bucket-lists' is also still recognized here -- that used to be its own
// leftmost tab, but The Bucket List now lives inside Momentum (see
// StrategyPage), so an old #/bucket-lists link lands there instead of
// falling through to the (now different) default route. 'core' is the same
// story one level up: Core (tagline + Year Progress widget) was its own
// leftmost tab before it was folded into the top of Momentum, so an old
// #/core link lands there too instead of 404-ing into the fallback route.
function readRouteFromHash(hash) {
  const tabMatch = hash.match(/^#\/(story|achievement|explore|strategy|profile|timeline|bucket-lists|core)\b/);
  if (tabMatch) {
    if (tabMatch[1] === 'timeline') {
      return 'achievement';
    }
    if (tabMatch[1] === 'bucket-lists' || tabMatch[1] === 'core') {
      return 'strategy';
    }
    return tabMatch[1];
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
