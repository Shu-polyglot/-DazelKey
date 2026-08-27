import { useState } from 'react';
import { supabase } from '../../lib/supabase';

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '24px',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600 }}>DazelKey</h1>

      {status === 'sent' ? (
        <p>メールを確認して、届いたリンクをクリックしてください。</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#111', color: '#fff' }}
          >
            {status === 'sending' ? '送信中…' : 'ログインリンクを送る'}
          </button>
          {status === 'error' && <p style={{ color: 'red', fontSize: '14px' }}>{errorMessage}</p>}
        </form>
      )}
    </div>
  );
}
