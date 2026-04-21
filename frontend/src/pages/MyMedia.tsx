import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { PhoneShell } from '../components/PhoneShell';

interface MediaItem { id: number; title: string; content_url: string; content_type: string; }

type SubTab = 'liked' | 'personals' | 'share';

function PersonalMediaViewer({ items, startIndex, onClose }: { items: MediaItem[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const [animDir, setAnimDir] = useState(0);
  const [animKey, setAnimKey] = useState(startIndex);
  const goTo = (next: number, dir: number) => { setAnimDir(dir); setAnimKey(next); setIdx(next); };
  const item = items[idx];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, zIndex: 200, background: '#000', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '48px 20px 16px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)' }}>
        <button onClick={onClose} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, background: 'rgba(0,0,0,0.4)', borderRadius: '20px', padding: '4px 12px' }}>{idx + 1} / {items.length}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={animKey} initial={{ opacity: 0, x: animDir * 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: animDir * -80 }} transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.content_type === 'image'
            ? <img src={item.content_url} alt={item.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            : <video src={item.content_url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%' }} />}
        </motion.div>
      </AnimatePresence>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 20px 48px', background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
        <p style={{ color: 'white', fontSize: '15px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{item.title}</p>
      </div>
      {idx > 0 && (
        <button onClick={() => goTo(idx - 1, -1)} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      {idx < items.length - 1 && (
        <button onClick={() => goTo(idx + 1, 1)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
    </motion.div>
  );
}

function LikedCategories() {
  const navigate = useNavigate();
  const [likes, setLikes] = useState<{ id: number; category: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get('/profile/likes/categories')
      .then(r => { setLikes(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await apiClient.delete(`/profile/likes/category/${id}`);
      setLikes(prev => prev.filter(l => l.id !== id));
    } catch {}
    setDeletingId(null);
  };

  if (loading) return <div className="flex justify-center py-8"><span style={{ color: 'var(--muted)', fontSize: '13px' }}>Loading…</span></div>;

  if (likes.length === 0) return (
    <div className="flex flex-col items-center gap-3 py-8">
      <span style={{ fontSize: '40px' }}>❤️</span>
      <p className="text-sm font-medium" style={{ color: 'var(--like)' }}>No liked content yet</p>
      <p className="text-xs text-center" style={{ color: 'var(--muted)', maxWidth: '220px', lineHeight: 1.6 }}>
        Tap the Like button while scrolling and your categories will appear here.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {likes.map(like => (
        <div key={like.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/', { state: { skipWelcome: true, category: like.category } })}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '16px', background: 'rgba(77,255,180,0.07)', border: '1px solid rgba(77,255,180,0.2)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '22px' }}>❤️</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>{like.category}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  {new Date(like.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </motion.button>
          <button onClick={(e) => handleDelete(e, like.id)} disabled={deletingId === like.id}
            style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: deletingId === like.id ? 0.5 : 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dislike)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function PersonalsTab() {
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    apiClient.get('/profile/media')
      .then(r => { setMedia(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    const form = new FormData();
    form.append('file', file);
    try {
      await apiClient.post('/profile/media', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const res = await apiClient.get('/profile/media');
      setMedia(res.data);
      showToast('Media uploaded!');
    } catch (err: any) {
      showToast(err?.response?.data?.detail || 'Upload failed');
    } finally { setUploadingMedia(false); }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await apiClient.delete(`/profile/media/${id}`);
      setMedia(prev => prev.filter(m => m.id !== id));
      showToast('Deleted!');
    } catch { showToast('Delete failed'); }
    setDeletingId(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence>
        {viewerIndex !== null && (
          <PersonalMediaViewer items={media} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: '60px', left: '50%', transform: 'translateX(-50%)', zIndex: 300, background: 'var(--like)', color: '#000', borderRadius: '20px', padding: '8px 20px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,201,122,0.35)' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single upload button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={() => mediaInputRef.current?.click()}
          disabled={uploadingMedia}
          style={{
            padding: '16px 40px', borderRadius: '16px', fontSize: '16px', fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif", cursor: uploadingMedia ? 'not-allowed' : 'pointer',
            background: 'rgba(176,138,255,0.15)', border: '2px solid rgba(176,138,255,0.45)',
            color: 'var(--fav)', opacity: uploadingMedia ? 0.6 : 1,
            transition: 'all 0.2s',
          }}>
          {uploadingMedia ? 'Uploading…' : 'Upload Files'}
        </button>
        <input ref={mediaInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
      </div>

      {loading && <div className="flex justify-center py-4"><span style={{ color: 'var(--muted)', fontSize: '13px' }}>Loading…</span></div>}

      {!loading && media.length > 0 && (
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>Your Uploads ({media.length})</p>
          <div className="grid grid-cols-2 gap-3">
            {media.map((item, i) => (
              <div key={item.id} style={{ position: 'relative' }}>
                <motion.div whileTap={{ scale: 0.96 }} onClick={() => setViewerIndex(i)}
                  className="rounded-2xl overflow-hidden cursor-pointer"
                  style={{ aspectRatio: '1', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  {item.content_type === 'image'
                    ? <img src={item.content_url} alt={item.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
                        style={{ background: 'linear-gradient(135deg, rgba(176,138,255,0.15), rgba(245,200,66,0.08))', color: 'var(--fav)' }}>▶</div>
                  }
                  <div className="absolute bottom-0 left-0 right-0 p-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <p style={{ fontSize: '10px', color: 'white' }}>{item.title}</p>
                  </div>
                </motion.div>
                <button onClick={(e) => handleDelete(e, item.id)} disabled={deletingId === item.id}
                  style={{ position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deletingId === item.id ? 0.5 : 1 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && media.length === 0 && !uploadingMedia && (
        <div className="flex flex-col items-center gap-2 py-4" style={{ color: 'var(--muted)' }}>
          <p className="text-sm">No personal media yet</p>
        </div>
      )}
    </div>
  );
}

function ShareTab({ shareToken, setShareToken }: { shareToken: string | null; setShareToken: (t: string) => void }) {
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const generateShareLink = async () => {
    setShareLoading(true);
    try {
      const res = await apiClient.post('/profile/share-link');
      setShareToken(res.data.share_token);
    } catch {}
    finally { setShareLoading(false); }
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/share/${shareToken}`;
    if (navigator.share) {
      navigator.share({ title: 'WishScroll', text: 'Tap to add a photo or video to my feed!', url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).then(() => { setShareCopied(true); setTimeout(() => setShareCopied(false), 2500); });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Share Your Feed</p>
        <p className="text-xs mb-4" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
          Generate a personal link. Anyone with the link can upload photos and videos directly to your WishScroll feed.
        </p>
        {!shareToken ? (
          <button onClick={generateShareLink}
            className="w-full rounded-xl py-4 text-sm font-semibold flex flex-col items-center gap-2"
            style={{ background: 'rgba(77,255,180,0.08)', border: '2px dashed rgba(77,255,180,0.35)', color: 'var(--like)', cursor: 'pointer' }}>
            <span style={{ fontSize: '28px' }}>🔗</span>
            <span>{shareLoading ? 'Generating…' : 'Generate Share Link'}</span>
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {window.location.origin}/share/{shareToken}
              </span>
            </div>
            <button onClick={handleShareLink}
              className="w-full rounded-xl py-3 text-sm font-semibold"
              style={{ background: shareCopied ? 'rgba(77,255,180,0.15)' : 'rgba(176,138,255,0.15)', border: `1px solid ${shareCopied ? 'rgba(77,255,180,0.45)' : 'rgba(176,138,255,0.45)'}`, color: shareCopied ? 'var(--like)' : 'var(--fav)', cursor: 'pointer', transition: 'all 0.3s' }}>
              {shareCopied ? '✓ Copied!' : '📤 Share Link'}
            </button>
            <p className="text-xs text-center" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
              Anyone with this link can upload photos & videos (max 20MB) to your personal feed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function MyMedia() {
  const navigate = useNavigate();
  const [subTab, setSubTab] = useState<SubTab>('liked');
  const [shareToken, setShareToken] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/profile/share-link').then(r => setShareToken(r.data.share_token)).catch(() => {});
  }, []);

  const SUB_TABS: { key: SubTab; label: string }[] = [
    { key: 'liked',     label: 'Liked'     },
    { key: 'personals', label: 'Personals' },
    { key: 'share',     label: 'Share'     },
  ];

  return (
    <PhoneShell>
      <div className="absolute inset-0 flex flex-col" style={{ background: 'var(--bg)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 flex-shrink-0"
          style={{ paddingTop: '52px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => navigate('/profile')}
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e8162a', border: '3px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(232,22,42,0.5)', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>&larr;</span>
          </button>
          <h1 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>My Media</h1>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-2 px-4 py-3 flex-shrink-0">
          {SUB_TABS.map(t => (
            <button key={t.key} onClick={() => setSubTab(t.key)}
              className="flex-1 rounded-xl py-3 text-sm font-semibold"
              style={{
                background: subTab === t.key ? 'rgba(212,160,23,0.18)' : 'var(--surface2)',
                border: `1px solid ${subTab === t.key ? 'rgba(212,160,23,0.6)' : 'var(--border)'}`,
                color: subTab === t.key ? 'var(--gold)' : 'var(--muted)',
                cursor: 'pointer', letterSpacing: '0.5px',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {subTab === 'liked'     && <LikedCategories />}
          {subTab === 'personals' && <PersonalsTab />}
          {subTab === 'share'     && <ShareTab shareToken={shareToken} setShareToken={setShareToken} />}
        </div>

      </div>
    </PhoneShell>
  );
}