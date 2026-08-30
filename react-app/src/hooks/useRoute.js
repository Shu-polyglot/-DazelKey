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

const HANDLE_PATTERN = '[a-z0-9_]{3,20}';

// A shared invite link (#/add-friend/somehandle) isn't one of the five
// tabs above -- it's a standalone screen (see AddFriendScreen) that
// takes over instead of the tab shell. Returns the handle, or null if
// the hash isn't an invite link.
export function readAddFriendHandleFromHash(hash) {
  const match = hash.match(new RegExp(`^#/add-friend/(${HANDLE_PATTERN})\\b`));
  return match ? match[1] : null;
}

// An invite link opened while signed out shows LoginScreen first (see
// App.jsx), and a magic-link click can land back in a completely
// different browser/app than the one the visitor started in (Mail's
// in-app browser vs. Safari, a Gmail webview vs. Chrome, etc.) --
// localStorage wouldn't survive that handoff. So instead of stashing
// the pending handle client-side, LoginScreen bakes it into
// emailRedirectTo as a query param (never the hash -- Supabase appends
// the session tokens there, and a second `#/add-friend/...` fragment
// ahead of them would break its own parsing). Query params survive
// that redirect untouched, so this reads it back on the other side.
export function readAddFriendHandleFromQuery(search) {
  const value = new URLSearchParams(search).get('invite');
  return value && new RegExp(`^${HANDLE_PATTERN}$`).test(value) ? value : null;
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
