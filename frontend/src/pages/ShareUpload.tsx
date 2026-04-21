import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

export function ShareUpload() {
  const { token } = useParams<{ token: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/share/${token}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setOwnerName(data.owner_name); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [token]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/share/${token}/upload`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Upload failed');
      }
      setUploaded(true);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f7ff' }}>
      <p style={{ color: '#999', fontFamily: "'DM Sans', sans-serif" }}>Loading…</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f7ff', gap: '12px' }}>
      <span style={{ fontSize: '48px' }}>🔗</span>
      <p style={{ fontSize: '18px', fontWeight: 700, color: '#1A1830', fontFamily: "'DM Sans', sans-serif" }}>Link not found</p>
      <p style={{ fontSize: '14px', color: '#999', fontFamily: "'DM Sans', sans-serif" }}>This share link is invalid or has been removed.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f7ff 0%, #fff9e6 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 700, color: '#1A1830', marginBottom: '4px' }}>
            Wish<span style={{ color: '#b08aff' }}>Scroll</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#999', fontFamily: "'DM Sans', sans-serif" }}>Your daily dose of joy</p>
        </div>

        {/* Card */}
        <div style={{ width: '100%', background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

          {!uploaded ? (
            <>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '52px', marginBottom: '12px' }}>📸</div>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#1A1830', fontFamily: "'DM Sans', sans-serif", marginBottom: '8px' }}>
                  {ownerName} invited you!
                </p>
                <p style={{ fontSize: '14px', color: '#888', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                  Share a photo or video to add it to their WishScroll feed
                </p>
              </div>

              {error && (
                <div style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(232,48,90,0.08)', border: '1px solid rgba(232,48,90,0.2)', color: '#e8305a', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  width: '100%', padding: '24px', borderRadius: '18px',
                  background: uploading ? 'rgba(176,138,255,0.05)' : 'rgba(176,138,255,0.08)',
                  border: '2px dashed rgba(176,138,255,0.5)',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  transition: 'all 0.2s',
                }}>
                <span style={{ fontSize: '36px' }}>{uploading ? '⏳' : '+'}</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#b08aff', fontFamily: "'DM Sans', sans-serif" }}>
                  {uploading ? 'Uploading…' : 'Tap to choose photo or video'}
                </span>
                <span style={{ fontSize: '12px', color: '#bbb', fontFamily: "'DM Sans', sans-serif" }}>
                  JPG, PNG, MP4 · Max 20MB
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                style={{ display: 'none' }}
                onChange={handleUpload}
              />
            </>
          ) : (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '64px' }}>🎉</div>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#1A1830', fontFamily: "'DM Sans', sans-serif" }}>
                Uploaded!
              </p>
              <p style={{ fontSize: '14px', color: '#888', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                Your photo/video has been added to {ownerName}'s WishScroll feed.
              </p>
            </div>
          )}
        </div>

        <p style={{ fontSize: '12px', color: '#bbb', fontFamily: "'DM Sans', sans-serif" }}>
          Powered by WishScroll
        </p>
      </div>
    </div>
  );
}