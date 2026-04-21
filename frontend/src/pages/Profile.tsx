import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { PhoneShell } from '../components/PhoneShell';

type MainTab = 'profile' | 'media' | null;
type ProfileSubTab = 'info' | 'security';

interface Stats { likes: number; saves: number; dislikes: number; }

export function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [mainTab, setMainTab] = useState<MainTab>(null);
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('info');
  const [stats, setStats] = useState<Stats>({ likes: 0, saves: 0, dislikes: 0 });
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || '');
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState('');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    apiClient.get('/profile/stats').then(r => setStats(r.data)).catch(() => {});
    if (user?.avatar_url) setAvatarUrl(user.avatar_url);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const saveName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    try {
      await apiClient.put('/profile/', { name: displayName });
      showToast('Name updated!');
    } catch { showToast('Failed to update name'); }
    finally { setSavingName(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await apiClient.post('/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAvatarUrl(res.data.avatar_url);
      showToast('Profile photo updated!');
    } catch (err: any) {
      showToast(err?.response?.data?.detail || 'Upload failed');
    } finally { setUploadingAvatar(false); }
  };

  const handleChangePassword = async () => {
    setPwError('');
    if (!currentPw || !newPw || !confirmPw) { setPwError('All fields are required'); return; }
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return; }
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      await apiClient.post('/profile/change-password', { current_password: currentPw, new_password: newPw });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      showToast('Password changed successfully!');
    } catch (err: any) {
      setPwError(err?.response?.data?.detail || 'Failed to change password');
    } finally { setPwLoading(false); }
  };

  const initials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : 'Recently';

  const profileOpen = mainTab === 'profile';

  return (
    <PhoneShell>
      <div className="absolute inset-0 flex flex-col" style={{ background: 'var(--bg)' }}>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="absolute top-14 left-1/2 z-50 rounded-2xl px-5 py-3 text-sm font-medium"
              style={{ transform: 'translateX(-50%)', background: 'var(--like)', color: '#000', boxShadow: '0 4px 20px rgba(0,201,122,0.35)', whiteSpace: 'nowrap' }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banner */}
        <div className="relative flex-shrink-0" style={{ height: '160px' }}>
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.2) 0%, rgba(176,138,255,0.18) 50%, rgba(77,255,180,0.1) 100%)' }} />
          <button onClick={() => navigate('/', { state: { skipWelcome: true } })}
            className="absolute top-14 left-4 rounded-full flex items-center justify-center"
            style={{ width: '52px', height: '52px', background: '#e8162a', border: '3px solid white', cursor: 'pointer', boxShadow: '0 4px 16px rgba(232,22,42,0.5)' }}>
            <span style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', lineHeight: 1 }}>&larr;</span>
          </button>
          <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '-44px' }}>
            <div className="relative">
              <motion.div whileHover={{ scale: 1.05 }}
                onClick={() => avatarInputRef.current?.click()}
                className="rounded-full flex items-center justify-center font-display font-bold text-2xl overflow-hidden cursor-pointer"
                style={{ width: '84px', height: '84px', background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, var(--gold), var(--fav))', border: '3px solid white', boxShadow: '0 0 24px rgba(212,160,23,0.35)' }}
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  : <span style={{ color: '#fff' }}>{initials}</span>
                }
              </motion.div>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <span style={{ color: 'white', fontSize: '12px' }}>...</span>
                </div>
              )}
              <div onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer text-xs font-bold"
                style={{ background: 'var(--gold)', border: '2px solid #fff', color: '#000' }}>+</div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
          </div>
        </div>

        {/* Name + email */}
        <div className="flex flex-col items-center px-5 mt-14 mb-5">
          <h2 className="font-display text-xl font-bold mb-1">{user?.name || 'Anonymous'}</h2>
          <p className="text-sm" style={{ color: 'var(--gold)' }}>@{user?.email?.split('@')[0]}</p>
        </div>

        {/* Main tabs row */}
        <div className="flex gap-3 px-5 mb-3">

          {/* Profile accordion button */}
          <div className="flex-1" style={{ position: 'relative' }}>
            <button
              onClick={() => setMainTab(profileOpen ? null : 'profile')}
              className="w-full rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
              style={{
                background: profileOpen ? 'rgba(176,138,255,0.15)' : 'var(--surface2)',
                border: `1px solid ${profileOpen ? 'rgba(176,138,255,0.45)' : 'var(--border)'}`,
                color: profileOpen ? 'var(--fav)' : 'var(--muted)',
                cursor: 'pointer',
                borderBottomLeftRadius: profileOpen ? '8px' : '12px',
                borderBottomRightRadius: profileOpen ? '8px' : '12px',
              }}>
              Profile
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={profileOpen ? 'var(--fav)' : 'var(--muted)'}
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Sub-tabs drop down visually connected */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: 'relative',
                    background: 'rgba(176,138,255,0.07)',
                    border: '1px solid rgba(176,138,255,0.35)',
                    borderTop: 'none',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                    padding: '6px 6px 6px 6px',
                    display: 'flex', gap: '6px',
                  }}>
                  {/* Connector line */}
                  <div style={{
                    position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
                    background: 'rgba(176,138,255,0.25)',
                  }} />
                  {([['info', 'Info'], ['security', 'Security']] as [ProfileSubTab, string][]).map(([key, label]) => (
                    <button key={key}
                      onClick={() => setProfileSubTab(key)}
                      className="flex-1 rounded-lg py-2 text-xs font-medium"
                      style={{
                        background: profileSubTab === key ? 'rgba(245,200,66,0.15)' : 'transparent',
                        border: `1px solid ${profileSubTab === key ? 'rgba(245,200,66,0.45)' : 'transparent'}`,
                        color: profileSubTab === key ? 'var(--gold)' : 'rgba(176,138,255,0.7)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}>
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* My Media button */}
          <button
            onClick={() => navigate('/my-media')}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}>
            My Media
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto pb-24 px-5">
          <AnimatePresence mode="wait">

            {profileOpen && profileSubTab === 'info' && (
              <motion.div key="info"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4">
                <div className="rounded-2xl p-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>Display Name</p>
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="ws-input w-full mb-3" placeholder="Your name" />
                  <button onClick={saveName} className="w-full rounded-xl py-2.5 text-sm font-medium"
                    style={{ background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.35)', color: 'var(--gold)', cursor: 'pointer' }}>
                    {savingName ? 'Saving…' : 'Save Name'}
                  </button>
                </div>
                <div className="rounded-2xl p-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>Account Info</p>
                  {[{ label: 'Email', val: user?.email ?? '—' }, { label: 'Joined', val: joinDate }].map(row => (
                    <div key={row.label} className="flex items-center gap-3 rounded-xl p-3 mb-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>
                        {row.label}: <span style={{ color: 'var(--text)', fontWeight: 500 }}>{row.val}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <button onClick={logout} className="w-full rounded-2xl p-3 text-sm font-medium"
                  style={{ background: 'rgba(255,107,138,0.08)', border: '1px solid rgba(255,107,138,0.2)', color: 'var(--dislike)', cursor: 'pointer' }}>
                  Sign Out
                </button>
              </motion.div>
            )}

            {profileOpen && profileSubTab === 'security' && (
              <motion.div key="security"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4">
                <div className="rounded-2xl p-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>Change Password</p>
                  {pwError && (
                    <div className="rounded-xl p-3 mb-3 text-sm"
                      style={{ background: 'rgba(232,48,90,0.1)', border: '1px solid rgba(232,48,90,0.3)', color: 'var(--dislike)' }}>
                      {pwError}
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    <div>
                      <p style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '6px', letterSpacing: '1px' }}>CURRENT PASSWORD</p>
                      <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="ws-input w-full" placeholder="Enter current password" />
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '6px', letterSpacing: '1px' }}>NEW PASSWORD</p>
                      <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="ws-input w-full" placeholder="Enter new password" />
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '6px', letterSpacing: '1px' }}>CONFIRM NEW PASSWORD</p>
                      <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="ws-input w-full" placeholder="Confirm new password" />
                    </div>
                    <button onClick={handleChangePassword} className="w-full rounded-xl py-3 text-sm font-medium mt-1"
                      style={{ background: 'rgba(176,138,255,0.15)', border: '1px solid rgba(176,138,255,0.45)', color: 'var(--fav)', cursor: 'pointer' }}>
                      {pwLoading ? 'Changing…' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

{!profileOpen && (
              <motion.div key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 pt-8 px-2">
                <span style={{ fontSize: '40px' }}></span>
                <p style={{
                  textAlign: 'center', lineHeight: 1.85,
                  fontSize: '13px', color: 'var(--muted)',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  A nurse once asked an elderly patient what she missed most.
                  She didn't say family, or home, or her garden.
                  <br /><br />
                  She said — <span style={{ color: 'var(--gold)', fontWeight: 600 }}>"just something beautiful to look at."</span>
                  <br /><br />
                  WishScroll was built for her. For the moments when the world feels small, and a little joy goes a long way.
                </p>
                <div style={{ width: '40px', height: '2px', borderRadius: '2px', background: 'rgba(212,160,23,0.3)', marginTop: '4px' }} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Bottom nav */}
        <div className="bottom-nav flex-shrink-0">
          <NavItem label="Feed"    active={false} onClick={() => navigate('/', { state: { skipWelcome: true } })} />
          <NavItem label="Profile" active={true}  onClick={() => {}} />
          <NavItem label="Favs"    active={false} onClick={() => navigate('/favourites')} />
        </div>
      </div>
    </PhoneShell>
  );
}

function NavItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 flex-1"
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
      <span style={{ fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', color: active ? 'var(--fav)' : 'var(--muted)', fontWeight: active ? 700 : 400 }}>{label}</span>
      {active && <div className="w-1 h-1 rounded-full" style={{ background: 'var(--fav)' }} />}
    </button>
  );
}