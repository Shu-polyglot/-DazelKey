import { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { easing, spring } from '../../styles/motion';
import dazelkeyLockup from '../../assets/logo/dazelkey-lockup-full.webp';
import InstallHint from './InstallHint';
import './Auth.css';

export default function LoginScreen({ pendingInviteHandle }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  // 'email' step: enter address, request a code. 'code' step: enter the
  // 6-digit code that arrived. status is shared across both.
  const [step, setStep] = useState('email');
  const [status, setStatus] = useState('idle'); // idle | busy | error
  const [errorMessage, setErrorMessage] = useState('');

  // Explicit, not left to Supabase's dashboard-configured Site URL:
  // GitHub Pages serves this app under a repo subpath (see vite.config's
  // `base`), and Site URL alone has proven unreliable for carrying that
  // path through -- particularly on an error redirect (expired/reused
  // link), where Supabase falls back to Site URL's bare origin and drops
  // it. `origin + BASE_URL` resolves correctly in every environment this
  // app ships to (GitHub Pages subpath, Vercel root, local dev).
  //
  // Only matters for the magic-link fallback below (verifyOtp never
  // navigates anywhere, so it has nothing to do with the code path) --
  // a pending invite rides along as `?invite=` (never the hash --
  // Supabase appends the session tokens there, and our own fragment
  // ahead of them would break its own parsing) so it survives even when
  // the link is opened in a different browser/app than this form was
  // submitted from -- see useRoute's readAddFriendHandleFromQuery.
  const redirectTo = pendingInviteHandle
    ? `${window.location.origin}${import.meta.env.BASE_URL}?invite=${pendingInviteHandle}`
    : `${window.location.origin}${import.meta.env.BASE_URL}`;

  async function handleSendCode(event) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    setStatus('busy');
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      return;
    }
    setStatus('idle');
    setStep('code');
  }

  // Unlike the magic link, this never leaves the tab -- no redirect, so
  // there's nothing for a pending invite (or anything else the page's
  // own state already knows) to survive. It just carries straight
  // through once useAuth's session listener picks up the new session.
  async function handleVerifyCode(event) {
    event.preventDefault();
    if (!code.trim()) {
      return;
    }
    setStatus('busy');
    setErrorMessage('');
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    });
    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      return;
    }
    // Success: useAuth's onAuthStateChange fires on its own and App.jsx
    // moves past LoginScreen -- nothing left to do here.
  }

  function handleUseDifferentEmail() {
    setStep('email');
    setStatus('idle');
    setErrorMessage('');
    setCode('');
  }

  return (
    <div className="login-screen">
      <motion.div
        className="login-logo-wrap"
        initial={{ opacity: 0, scale: 0.97, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease: easing.emphasized }}
      >
        <img
          src={dazelkeyLockup}
          alt="DazelKey — Unlock Unlived Moments"
          className="login-logo dazelkey-mark-inverted"
        />
      </motion.div>

      {step === 'email' ? (
        <motion.form
          className="login-form"
          onSubmit={handleSendCode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: easing.emphasized }}
        >
          <input
            type="email"
            required
            className="login-input"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <motion.button
            type="submit"
            className="login-submit"
            disabled={status === 'busy'}
            whileHover={{ y: -2, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
          >
            {status === 'busy' ? '送信中…' : '確認コードを送る'}
          </motion.button>
          {status === 'error' && <p className="login-error">{errorMessage}</p>}
        </motion.form>
      ) : (
        <motion.form
          className="login-form"
          onSubmit={handleVerifyCode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing.emphasized }}
        >
          <p className="login-message">
            {email} に届いた6桁のコードを入力してください。メール内のリンクをタップしても構いません。
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            className="login-input"
            placeholder="123456"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <motion.button
            type="submit"
            className="login-submit"
            disabled={status === 'busy'}
            whileHover={{ y: -2, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
          >
            {status === 'busy' ? '確認中…' : '確認する'}
          </motion.button>
          {status === 'error' && <p className="login-error">{errorMessage}</p>}
          <button type="button" className="login-link-button" onClick={handleUseDifferentEmail}>
            別のメールアドレスを使う
          </button>
        </motion.form>
      )}

      <InstallHint />
    </div>
  );
}
