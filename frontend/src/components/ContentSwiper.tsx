import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import type { Post } from '../types/api';
import { GestureController } from './GestureController';

interface ContentSwiperProps {
  posts: Post[];
  onLoadMore?: () => void;
}

type SwipeAction = 'like' | 'dislike' | 'share' | null;

const CATEGORY_PLAYLISTS: Record<string, string> = {
  Animals:     'PLpOGnzl7NluA-R4wXxGn2a5r0Ta35MNmO',
  Sports:      'PLpOGnzl7NluBNH8fOIpEvGB-oXHg4PRcj',
  Adrenaline:  'PLpOGnzl7NluCECALx2sfwfREfe1vxpx1q',
  Art:         'PLpOGnzl7NluD6Igna56-sT8uKCEkRTZIe',
  Learn:       'PLpOGnzl7NluBqLZtzYGrKF4k4hnCT6AeK',
  Funny:       'PLpOGnzl7NluDU9EVYlyoql8ifAnCgaRsY',
  Kindness:    'PLpOGnzl7NluAvfOxnHqW22AKFBelesNtO',
  Interesting: 'PLpOGnzl7NluD_t3Jlq8VMpw08U3uKF1Ld',
};

const CATEGORIES = Object.keys(CATEGORY_PLAYLISTS);
const ALL_CATEGORIES = [...CATEGORIES, 'My Media'];

interface MediaItem { id: number; title: string; content_url: string; content_type: string; }

function WelcomeScreen({ onCategoriesSelect }: { onCategoriesSelect: (cats: string[]) => void }) {
  const [glowIndex, setGlowIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const words = ['Welcome', 'to', 'happy', 'scrolling...'];

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIndex(prev => (prev + 1) % ALL_CATEGORIES.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const toggleCategory = (cat: string) => {
    setSelected(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleWish = () => {
    if (selected.length > 0) onCategoriesSelect(selected);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#ffffff',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px', gap: '24px',
      overflowY: 'auto',
    }}>
      <style>{`
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 8px rgba(0,0,0,0.4), 0 0 20px rgba(0,0,0,0.2); }
          50% { text-shadow: 0 0 16px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.4), 0 0 60px rgba(0,0,0,0.2); }
        }
        @keyframes btnGlow {
          0%, 100% { box-shadow: 0 0 6px rgba(212,160,23,0.3), 0 2px 8px rgba(0,0,0,0.08); }
          50% { box-shadow: 0 0 20px rgba(212,160,23,0.9), 0 0 40px rgba(212,160,23,0.5), 0 4px 16px rgba(0,0,0,0.15); }
        }
      `}</style>

      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          {words.map((word, i) => (
            <motion.span key={word}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.18, duration: 0.5, ease: 'easeOut' }}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '28px', fontWeight: 700, color: '#000000',
                animation: 'textGlow 2.5s ease-in-out infinite',
                animationDelay: `${i * 0.3}s`,
              }}
            >{word}</motion.span>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{ fontSize: '16px', color: 'rgba(0,0,0,0.5)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, textAlign: 'center' }}
        >
          Select one or more categories to start
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', width: '100%', maxWidth: '340px' }}
      >
        {ALL_CATEGORIES.map((cat, i) => {
          const isSelected = selected.includes(cat);
          const isGlowing = glowIndex === i && !isSelected;
          const isMyMedia = cat === 'My Media';
          return (
            <motion.button key={cat}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.07, type: 'spring', stiffness: 300, damping: 20 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => toggleCategory(cat)}
              style={{
                padding: '18px 12px',
                borderRadius: '18px',
                border: isSelected
                  ? `2px solid ${isMyMedia ? 'rgba(176,138,255,1)' : 'rgba(212,160,23,1)'}`
                  : isGlowing
                    ? `2px solid ${isMyMedia ? 'rgba(176,138,255,0.9)' : 'rgba(212,160,23,0.9)'}`
                    : `2px solid ${isMyMedia ? 'rgba(176,138,255,0.3)' : 'rgba(212,160,23,0.3)'}`,
                background: isSelected
                  ? isMyMedia ? 'rgba(176,138,255,0.22)' : 'rgba(212,160,23,0.22)'
                  : isGlowing
                    ? isMyMedia ? 'rgba(176,138,255,0.12)' : 'rgba(212,160,23,0.12)'
                    : isMyMedia ? 'rgba(176,138,255,0.04)' : 'rgba(212,160,23,0.04)',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '17px', fontWeight: isSelected ? 700 : 600,
                color: '#1A1830', letterSpacing: '0.3px',
                transition: 'border 0.3s, background 0.3s, box-shadow 0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {isSelected && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isMyMedia ? 'rgba(176,138,255,1)' : 'rgba(180,130,10,1)'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {isMyMedia ? '🎞 My Media' : cat}
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        style={{ width: '100%', maxWidth: '340px' }}
      >
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleWish}
          disabled={selected.length === 0}
          style={{
            width: '100%', padding: '20px', borderRadius: '20px', border: 'none',
            background: selected.length > 0
              ? 'linear-gradient(135deg, #D4A017, #f0c040)'
              : 'rgba(200,200,200,0.4)',
            cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '20px', fontWeight: 800,
            color: selected.length > 0 ? '#1A1830' : 'rgba(100,100,100,0.5)',
            letterSpacing: '3px',
            boxShadow: selected.length > 0 ? '0 4px 24px rgba(212,160,23,0.5), 0 2px 8px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          WISH
        </motion.button>
      </motion.div>
    </div>
  );
}

function MyMediaViewer({ onEmpty }: { onEmpty: () => void }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animDir, setAnimDir] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    apiClient.get('/profile/media')
      .then(r => { setMedia(r.data); setLoading(false); if (r.data.length === 0) onEmpty(); })
      .catch(() => setLoading(false));
  }, []);

  const goTo = (next: number, dir: number) => {
    setAnimDir(dir);
    setAnimKey(next);
    setIdx(next);
  };

  if (loading) return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>Loading your media…</span>
    </div>
  );

  if (media.length === 0) return (
    <div style={{ position: 'absolute', inset: 0, background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <span style={{ fontSize: '48px' }}>🎞</span>
      <p style={{ color: 'white', fontSize: '16px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>No personal media yet</p>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', maxWidth: '240px', lineHeight: 1.6 }}>
        Upload photos and videos in Profile → My Media → Personals
      </p>
    </div>
  );

  const item = media[idx];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={animKey}
          initial={{ opacity: 0, x: animDir * 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: animDir * -80 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {item.content_type === 'image'
            ? <img src={item.content_url} alt={item.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            : <video src={item.content_url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%' }} />
          }
        </motion.div>
      </AnimatePresence>

      <div style={{ position: 'absolute', top: '56px', left: '50%', transform: 'translateX(-50%)', zIndex: 10,
        background: 'rgba(0,0,0,0.5)', borderRadius: '20px', padding: '4px 14px' }}>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          {idx + 1} / {media.length}
        </span>
      </div>

      <div style={{ position: 'absolute', bottom: '100px', left: 0, right: 0, padding: '16px 20px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
        <p style={{ color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{item.title}</p>
      </div>

      {idx > 0 && (
        <button onClick={() => goTo(idx - 1, -1)} style={{
          position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      )}

      {idx < media.length - 1 && (
        <button onClick={() => goTo(idx + 1, 1)} style={{
          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      )}
    </div>
  );
}

export function ContentSwiper({ posts, onLoadMore }: ContentSwiperProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { skipWelcome?: boolean; category?: string } | null;
  const skipWelcome = locationState?.skipWelcome === true;
  const incomingCategory = locationState?.category;

  const [activeCategories, setActiveCategories] = useState<string[]>(
    incomingCategory ? [incomingCategory] : skipWelcome ? [CATEGORIES[0]] : []
  );
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState<'like' | 'dislike' | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [castToast, setCastToast] = useState(false);
  const [showGesture, setShowGesture] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasCategories = activeCategories.length > 0;
  const activeCategory = activeCategories[activeCategoryIndex];
  const isMyMedia = activeCategory === 'My Media';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showDropdown]);

  const handleWelcomeCategoriesSelect = (cats: string[]) => {
    setActiveCategories(cats);
    setActiveCategoryIndex(0);
    setCurrentIndex(0);
  };

  const toggleDropdownCategory = (cat: string) => {
    setActiveCategories(prev => {
      if (prev.includes(cat)) {
        if (prev.length === 1) return prev;
        const next = prev.filter(c => c !== cat);
        setActiveCategoryIndex(idx => Math.min(idx, next.length - 1));
        return next;
      } else {
        return [...prev, cat];
      }
    });
    setCurrentIndex(0);
  };

  const handleCast = useCallback(() => {
    // Try Presentation API (Chromecast / Cast to TV)
    if ((navigator as any).presentation) {
      try {
        const playlistId = activeCategory ? CATEGORY_PLAYLISTS[activeCategory] : null;
        const castUrl = playlistId
          ? `https://www.youtube.com/watch?list=${playlistId}`
          : window.location.href;
        const request = new (window as any).PresentationRequest([castUrl]);
        request.start().catch(() => {
          // Fallback: try native share
          triggerShare();
        });
        return;
      } catch {
        // fall through
      }
    }
    triggerShare();
  }, [activeCategory]);

  const triggerShare = () => {
    const playlistId = activeCategory ? CATEGORY_PLAYLISTS[activeCategory] : null;
    const shareUrl = playlistId
      ? `https://www.youtube.com/playlist?list=${playlistId}`
      : window.location.href;

    if (navigator.share) {
      navigator.share({
        title: `WishScroll — ${activeCategory ?? 'Watch'}`,
        text: 'Watch this on your TV or another screen!',
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareUrl).catch(() => {});
      setCastToast(true);
      setTimeout(() => setCastToast(false), 2500);
    }
  };

  const advance = useCallback((action: SwipeAction) => {
    if (!action) return;
    if (action === 'like' || action === 'dislike') {
      setShowPopup(action);
      if (action === 'like') {
        apiClient.post('/profile/likes/category', { category: activeCategory }).catch(() => {});
      }
      setTimeout(() => setShowPopup(null), 700);
    }
    if (action === 'share') {
      const playlistId = activeCategory ? CATEGORY_PLAYLISTS[activeCategory] : null;
      const url = playlistId ? `https://www.youtube.com/playlist?list=${playlistId}` : window.location.href;
      if (navigator.share) {
        navigator.share({ title: activeCategory ?? 'WishScroll', url }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(url).catch(() => {});
      }
    }
  }, [activeCategoryIndex, activeCategories, activeCategory]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft:  () => advance('dislike'),
    onSwipedRight: () => advance('like'),
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 40,
  });

  if (!hasCategories) {
    return (
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5" style={{ paddingTop: '44px' }}>
          <span className="font-display font-bold" style={{ fontSize: '22px', letterSpacing: '2px', color: '#1A1830' }}>Wish</span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/profile')}
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A1830, #444)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </motion.button>
        </div>
        <WelcomeScreen onCategoriesSelect={handleWelcomeCategoriesSelect} />
      </div>
    );
  }

  const playlistId = CATEGORY_PLAYLISTS[activeCategory];
  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&mute=${isMuted ? 1 : 0}`;
  const badgeLabel = activeCategories.length === 1 ? activeCategories[0] : 'Filtered';
  const isFiltered = activeCategories.length > 1;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#000', touchAction: 'none' }} {...(isMyMedia ? {} : swipeHandlers)}>

      {isMyMedia && <MyMediaViewer onEmpty={() => {}} />}

      {!isMyMedia && (
        <AnimatePresence initial={false}>
          <motion.div key={activeCategory + (isMuted ? '-muted' : '-unmuted')}
            initial={{ opacity: 0, x: direction.x }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0">
            <iframe src={embedUrl} className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title={activeCategory} />
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {showPopup && (
          <motion.div key={showPopup}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50, pointerEvents: 'none' }}>
            <span style={{ fontSize: '90px', lineHeight: 1, filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.5))' }}>
              {showPopup === 'like' ? '❤️' : '💔'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cast toast notification */}
      <AnimatePresence>
        {castToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute', bottom: '120px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(20,20,30,0.92)', border: '1px solid rgba(212,160,23,0.4)',
              borderRadius: '16px', padding: '10px 20px', zIndex: 60, whiteSpace: 'nowrap',
            }}>
            <span style={{ color: 'rgba(212,160,23,1)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
              📋 Link copied — paste it on your TV browser!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 left-0 right-0 h-36 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-36 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-start justify-between px-5" style={{ paddingTop: '44px' }}>
        <div style={{ position: 'relative', paddingTop: '4px' }} ref={dropdownRef}>
          <button onClick={() => setShowDropdown(p => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '12px' }}>
            <span className="font-display font-bold" style={{ fontSize: '28px', letterSpacing: '2px', color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>Wish</span>
            <span style={{
              background: isFiltered ? 'rgba(212,160,23,0.2)' : isMyMedia ? 'rgba(176,138,255,0.2)' : 'rgba(0,201,122,0.15)',
              border: isFiltered ? '1px solid rgba(212,160,23,0.7)' : isMyMedia ? '1px solid rgba(176,138,255,0.7)' : '1px solid rgba(0,201,122,0.45)',
              color: isFiltered ? 'rgba(212,160,23,1)' : isMyMedia ? 'rgba(176,138,255,1)' : 'rgba(0,201,122,1)',
              borderRadius: '20px', padding: '3px 10px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
              fontFamily: "'DM Sans', sans-serif",
            }}>{badgeLabel}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(212,160,23,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: 'absolute', top: '52px', left: 0,
                  background: 'rgba(15,15,20,0.97)',
                  border: '1px solid rgba(212,160,23,0.25)',
                  borderRadius: '20px', padding: '12px',
                  minWidth: '220px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 100,
                }}>
                <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', paddingLeft: '4px', fontFamily: "'DM Sans', sans-serif" }}>
                  Select Categories
                </p>
                {ALL_CATEGORIES.map(cat => {
                  const isActive = activeCategories.includes(cat);
                  const isMM = cat === 'My Media';
                  return (
                    <button key={cat} onClick={() => toggleDropdownCategory(cat)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        width: '100%', border: 'none', cursor: 'pointer',
                        padding: '10px 8px', borderRadius: '10px',
                        background: isActive ? isMM ? 'rgba(176,138,255,0.12)' : 'rgba(212,160,23,0.12)' : 'transparent',
                        marginBottom: '2px', transition: 'background 0.15s',
                      } as React.CSSProperties}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                        border: isActive ? isMM ? '2px solid rgba(176,138,255,1)' : '2px solid rgba(212,160,23,1)' : '2px solid rgba(255,255,255,0.2)',
                        background: isActive ? isMM ? 'rgba(176,138,255,0.2)' : 'rgba(212,160,23,0.2)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                      }}>
                        {isActive && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isMM ? 'rgba(176,138,255,1)' : 'rgba(212,160,23,1)'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <span style={{
                        fontSize: '15px',
                        color: isActive ? isMM ? 'rgba(176,138,255,1)' : 'rgba(212,160,23,1)' : 'rgba(255,255,255,0.85)',
                        fontWeight: isActive ? 700 : 400,
                        fontFamily: "'DM Sans', sans-serif",
                      }}>{isMM ? '🎞 My Media' : cat}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile + Mute + Cast */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>

          {/* Profile button with dropdown */}
          <div style={{ position: 'relative' }}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowProfileMenu(p => !p)}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ffffff, #cccccc)', boxShadow: '0 0 14px rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </motion.button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -6 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: '48px', right: 0,
                    background: 'rgba(15,15,20,0.97)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '16px', overflow: 'hidden',
                    minWidth: '140px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                    zIndex: 100,
                  }}>
                  <button
                    onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      width: '100%', border: 'none', cursor: 'pointer',
                      padding: '14px 16px', background: 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Menu</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      localStorage.removeItem('ws_token');
                      navigate('/login');
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      width: '100%', border: 'none', cursor: 'pointer',
                      padding: '14px 16px', background: 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,40,40,0.12)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,100,100,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <span style={{ color: 'rgba(255,100,100,0.9)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isMyMedia && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsMuted(m => !m)}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: isMuted ? 'rgba(212,160,23,0.9)' : 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: isMuted ? '2px solid rgba(212,160,23,1)' : '2px solid rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              {isMuted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1830" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              )}
            </motion.button>
          )}

          {/* Cast / Screen Share button */}
          {!isMyMedia && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCast}
              title="Cast to TV or screen"
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(255,255,255,0.3)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8.5A12.5 12.5 0 0 1 14.5 21"/>
                <path d="M2 13a8 8 0 0 1 8 8"/>
                <circle cx="2" cy="21" r="1" fill="white"/>
                <rect x="9" y="3" width="13" height="10" rx="2"/>
                <path d="M9 17h13"/>
              </svg>
            </motion.button>
          )}

          {/* Gesture Control toggle button */}
          {!isMyMedia && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowGesture(g => !g)}
              title={showGesture ? 'Disable gesture control' : 'Enable gesture control'}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: showGesture ? 'rgba(220,40,40,0.9)' : 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: showGesture ? '2px solid rgba(255,60,60,1)' : '2px solid rgba(255,255,255,0.3)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: showGesture ? '0 0 12px rgba(220,40,40,0.6)' : 'none',
              }}>
              {showGesture ? (
                // Eye with slash = active/disable
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                // Normal eye = inactive/enable
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {!isMyMedia && (
        <div className="absolute z-40 flex items-center justify-between px-8" style={{ bottom: '32px', left: 0, right: 0 }}>
          <div className="flex flex-col items-center gap-2" style={{ position: 'relative' }}>
            <AnimatePresence>
              {showPopup === 'dislike' && (
                <motion.span key="dislike-emoji"
                  initial={{ opacity: 0, scale: 0.3, y: 0 }} animate={{ opacity: 1, scale: 1.3, y: -20 }} exit={{ opacity: 0, scale: 0.5, y: -40 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  style={{ position: 'absolute', top: '-60px', fontSize: '48px', lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))', pointerEvents: 'none', zIndex: 50 }}>
                  💔
                </motion.span>
              )}
            </AnimatePresence>
            <motion.button whileTap={{ scale: 0.82 }} onClick={() => advance('dislike')}
              className="action-btn-base btn-dislike" style={{ width: '64px', height: '64px' }} aria-label="Dislike">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"/>
                <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
              </svg>
            </motion.button>
            <span style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--dislike)', fontWeight: 600 }}>Dislike</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <motion.button whileTap={{ scale: 0.82 }} onClick={() => advance('share')}
              style={{ width: '76px', height: '76px', borderRadius: '50%', background: '#ffffff', border: '3px solid #000000', boxShadow: '0 4px 20px rgba(0,0,0,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </motion.button>
            <span style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Share</span>
          </div>

          <div className="flex flex-col items-center gap-2" style={{ position: 'relative' }}>
            <AnimatePresence>
              {showPopup === 'like' && (
                <motion.span key="like-emoji"
                  initial={{ opacity: 0, scale: 0.3, y: 0 }} animate={{ opacity: 1, scale: 1.3, y: -20 }} exit={{ opacity: 0, scale: 0.5, y: -40 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  style={{ position: 'absolute', top: '-60px', fontSize: '48px', lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))', pointerEvents: 'none', zIndex: 50 }}>
                  ❤️
                </motion.span>
              )}
            </AnimatePresence>
            <motion.button whileTap={{ scale: 0.82 }} onClick={() => advance('like')}
              className="action-btn-base btn-like" style={{ width: '64px', height: '64px' }} aria-label="Like">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/>
                <path d="M7 22H4.72A2.31 2.31 0 0 1 2.4 20V13a2.31 2.31 0 0 1 2.32-2H7"/>
              </svg>
            </motion.button>
            <span style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--like)', fontWeight: 600 }}>Like</span>
          </div>
        </div>
      )}

      {/* Gesture Controller overlay — pointerEvents only active when panel is visible */}
      {showGesture && (
        <GestureController
          onLike={() => advance('like')}
          onDislike={() => advance('dislike')}
          onToggleMute={() => setIsMuted(m => !m)}
          onTogglePlay={() => {}}
          onClose={() => setShowGesture(false)}
        />
      )}
    </div>
  );
}