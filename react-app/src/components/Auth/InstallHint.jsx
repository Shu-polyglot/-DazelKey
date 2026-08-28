import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { easing } from '../../styles/motion';
import './Auth.css';

// Persisted so a visitor who dismisses this never sees it again on this
// device -- there's no "remind me later", just off.
const DISMISS_KEY = 'dazelkey-install-hint-dismissed';

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
}

// iPadOS 13+ identifies itself as "MacIntel" with no touch-point hint in
// the UA string, so a touch-capable "Mac" is the only reliable signal
// left to tell it apart from an actual Mac.
function isIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

// The iOS share-sheet glyph (arrow up out of an open tray) -- same motif
// as ProfilePage's own ShareIcon, redrawn here rather than shared across
// files for one icon.
function ShareGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M12 3 V15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M8 7 L12 3 L16 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 12 V18.5 C5 19.6 5.9 20.5 7 20.5 H17 C18.1 20.5 19 19.6 19 18.5 V12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/*
  Nudges a first-time visitor to install DazelKey as an app. iOS has no
  install-prompt API at all -- Safari only supports the manual Share ->
  Add to Home Screen path -- so that side is just an instruction. Android
  Chrome fires `beforeinstallprompt`, which this captures and replays
  from a real button tap (the event's own `.prompt()` only works inside a
  user gesture, so it has to be stashed and called later, not consumed
  immediately). Renders nothing once installed (standalone), on desktop,
  or after being dismissed once.
*/
function InstallHint() {
  const [platform, setPlatform] = useState(null); // 'ios' | 'android' | null
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (isStandalone()) {
      return undefined;
    }
    if (isIOS()) {
      setPlatform('ios');
      return undefined;
    }

    if (!isAndroid()) {
      // Desktop Chrome/Edge fire beforeinstallprompt too, but "add this
      // to your home screen" is a phone-only pitch -- skip it elsewhere.
      return undefined;
    }

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
      setPlatform('android');
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // No persistence available -- it'll just show again next visit.
    }
  }

  async function handleInstallClick() {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  const visible = !dismissed && platform;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="install-hint"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: easing.emphasized }}
        >
          {platform === 'ios' ? (
            <p className="install-hint-text">
              <ShareGlyph /> 共有ボタン→「ホーム画面に追加」でアプリのように使えます
            </p>
          ) : (
            <p className="install-hint-text">ホーム画面に追加して、アプリのように使えます</p>
          )}

          {platform === 'android' && (
            <button type="button" className="install-hint-cta" onClick={handleInstallClick}>
              インストール
            </button>
          )}

          <button type="button" className="install-hint-dismiss" aria-label="閉じる" onClick={dismiss}>
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InstallHint;
