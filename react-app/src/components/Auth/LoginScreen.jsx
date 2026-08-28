import { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { easing, spring } from '../../styles/motion';
import dazelkeyLockup from '../../assets/logo/dazelkey-lockup-full.png';
import './Auth.css';

export default function LoginScreen() {
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
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
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
    </div>
  );
}
