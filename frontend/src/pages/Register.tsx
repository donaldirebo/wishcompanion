import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { PhoneShell } from '../components/PhoneShell';

export function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await register(email, password, name || username || undefined);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
          top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(176,138,255,0.1) 0%, transparent 70%)',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative z-10 py-8"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(212,160,23,0.1))',
                border: '1px solid rgba(139,92,246,0.3)',
                boxShadow: '0 0 24px rgba(139,92,246,0.2)',
              }}>
              ✨
            </div>
            <h1 className="font-display text-3xl font-bold mb-1 gradient-fav">Join WishScroll</h1>
            <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Create your account to get started</p>
          </div>

          <div className="rounded-3xl p-7" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 48px rgba(139,92,246,0.08), 0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="ws-input"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="ws-input"
                    placeholder="janedoe"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>Email Address</label>
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
                <label style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="ws-input"
                    style={{ paddingRight: '48px' }}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
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

              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="ws-input"
                  placeholder="Repeat password"
                  required
                />
              </div>

              {password.length > 0 && (
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{
                        background: password.length >= i * 2
                          ? i <= 1 ? 'var(--dislike)'
                          : i <= 2 ? 'var(--gold)'
                          : 'var(--like)'
                          : 'var(--surface2)'
                      }}
                    />
                  ))}
                </div>
              )}

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
                    Creating account…
                  </span>
                ) : 'Create Account'}
              </button>

              <p className="text-center" style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>
        </motion.div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </PhoneShell>
  );
}