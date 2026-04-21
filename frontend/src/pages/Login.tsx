import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { PhoneShell } from '../components/PhoneShell';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneShell>
      <div
        className="absolute inset-0 flex items-center justify-center px-5 overflow-y-auto"
        style={{ background: 'var(--bg)' }}
      >
        <div className="absolute pointer-events-none" style={{
          top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '550px', height: '420px',
          background: 'radial-gradient(ellipse, rgba(212,160,23,0.16) 0%, transparent 65%)',
        }} />
        <div className="absolute pointer-events-none" style={{
          bottom: '-100px', right: '-80px',
          width: '400px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm relative z-10 py-8"
        >
          <div className="flex flex-col items-center mb-10">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5"
              style={{
                background: 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(139,92,246,0.15))',
                border: '1px solid rgba(212,160,23,0.35)',
                boxShadow: '0 0 32px rgba(212,160,23,0.25)',
              }}
            >
              ✨
            </motion.div>
            <h1 className="font-display text-4xl font-bold mb-1 gradient-gold">WishScroll</h1>
            <p style={{ color: 'var(--muted)', fontSize: '13px', letterSpacing: '0.5px' }}>
              Your daily dose of joy
            </p>
          </div>

          <div className="rounded-3xl p-8" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 48px rgba(139,92,246,0.08), 0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="ws-input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="ws-input"
                    style={{ paddingRight: '48px' }}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{ background: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.3)', color: 'var(--dislike)' }}
                >
                  {error}
                </motion.div>
              )}

              <button type="submit" disabled={loading} className="ws-btn-primary mt-1">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent"
                      style={{ animation: 'spin 0.7s linear infinite' }} />
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>or</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              <div className="flex flex-col items-center gap-3">
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  New here?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </form>
          </div>
        </motion.div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </PhoneShell>
  );
}