import { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { easing, spring } from '../../styles/motion';
import dazelkeyLockup from '../../assets/logo/dazelkey-lockup-full.webp';
import InstallHint from './InstallHint';
import './Auth.css';

export default function LoginScreen({ pendingInviteHandle }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    setStatus('sending');
    setErrorMessage('');
    // Explicit, not left to Supabase's dashboard-configured Site URL:
    // GitHub Pages serves this app under a repo subpath (see vite.config's
    // `base`), and Site URL alone has proven unreliable for carrying that
    // path through -- particularly on an error redirect (expired/reused
    // link), where Supabase falls back to Site URL's bare origin and drops
    // it. `origin + BASE_URL` resolves correctly in every environment this
    // app ships to (GitHub Pages subpath, Vercel root, local dev).
    //
    // A pending invite rides along as `?invite=` (never the hash --
    // Supabase appends the session tokens there, and our own fragment
    // ahead of them would break its own parsing) so it survives even
    // when the magic-link click opens in a different browser/app than
    // this form was submitted from -- see useRoute's
    // readAddFriendHandleFromQuery.
    const redirectTo = pendingInviteHandle
      ? `${window.location.origin}${import.meta.env.BASE_URL}?invite=${pendingInviteHandle}`
      : `${window.location.origin}${import.meta.env.BASE_URL}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      return;
    }
    setStatus('sent');
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

      {status === 'sent' ? (
        <motion.p
          className="login-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing.emphasized }}
        >
          メールを確認して、届いたリンクをクリックしてください。
        </motion.p>
      ) : (
        <motion.form
          className="login-form"
          onSubmit={handleSubmit}
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
            disabled={status === 'sending'}
            whileHover={{ y: -2, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
          >
            {status === 'sending' ? '送信中…' : 'ログインリンクを送る'}
          </motion.button>
          {status === 'error' && <p className="login-error">{errorMessage}</p>}
        </motion.form>
      )}

      <InstallHint />
    </div>
  );
}
