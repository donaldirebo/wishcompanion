import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { contentService } from '../services/contentService';
import { PhoneShell } from '../components/PhoneShell';
import type { Post } from '../types/api';

const SOURCE_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  reddit:  'Reddit',
};

export function Favourites() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showRemoved, setShowRemoved] = useState(false);
  const dwellStart = useRef<number>(Date.now());

  useEffect(() => {
    contentService.getFavorites()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const goTo = useCallback((nextIndex: number, dir: { x: number; y: number }) => {
    setDirection(dir);
    dwellStart.current = Date.now();
    setCurrentIndex(nextIndex);
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex < posts.length - 1) {
      goTo(currentIndex + 1, { x: 0, y: -500 });
    }
  }, [currentIndex, posts.length, goTo]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      goTo(currentIndex - 1, { x: 0, y: 500 });
    }
  }, [currentIndex, goTo]);

  const removeFromFavourites = useCallback(() => {
    if (!posts[currentIndex]) return;
    const post = posts[currentIndex];
    setShowRemoved(true);

    contentService.interact(post.id, {
      interaction_type: 'dislike',
      dwell_time_seconds: Math.floor((Date.now() - dwellStart.current) / 1000),
    }).catch(() => {});

    setTimeout(() => {
      setShowRemoved(false);
      const newPosts = posts.filter((_, i) => i !== currentIndex);
      setPosts(newPosts);
      if (currentIndex >= newPosts.length && newPosts.length > 0) {
        setCurrentIndex(newPosts.length - 1);
      }
    }, 520);
  }, [posts, currentIndex]);

  const swipeHandlers = useSwipeable({
    onSwipedUp:   () => goNext(),
    onSwipedDown: () => goPrev(),
    onSwipedLeft: () => removeFromFavourites(),
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 40,
  });

  if (loading) return (
    <PhoneShell>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6"
        style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--fav)', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </PhoneShell>
  );

  if (posts.length === 0) return (
    <PhoneShell>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8"
        style={{ background: 'var(--bg)' }}>
        <span className="text-5xl">💜</span>
        <p className="font-display text-xl text-center" style={{ color: 'var(--text)' }}>No favourites yet</p>
        <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>
          Tap the heart button on any post to save it here
        </p>
        <button onClick={() => navigate('/')} className="ws-btn-primary" style={{ maxWidth: '220px' }}>
          Discover Content
        </button>
      </div>
    </PhoneShell>
  );

  const currentPost = posts[currentIndex];
  const tag = currentPost?.tags?.[0] ?? currentPost?.source;

  return (
    <PhoneShell>
      <div className="absolute inset-0 overflow-hidden" style={{ background: '#000', touchAction: 'none' }} {...swipeHandlers}>

        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentPost.id}
            custom={direction}
            initial={{ opacity: 0, x: direction.x, y: direction.y }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -direction.x / 2, y: -direction.y / 2 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            {currentPost.content_type === 'video' ? (
              <iframe
                src={currentPost.content_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; encrypted-media"
                allowFullScreen
                title={currentPost.title}
              />
            ) : (
              <img
                src={currentPost.content_url}
                alt={currentPost.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showRemoved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="absolute z-40 font-display font-bold text-xl tracking-widest"
              style={{
                top: '38%', left: '50%',
                transform: 'translateX(-50%) rotate(5deg)',
                color: 'var(--dislike)',
                background: 'rgba(232,48,90,0.12)',
                border: '2px solid rgba(232,48,90,0.55)',
                borderRadius: '14px',
                padding: '10px 28px',
                boxShadow: '0 0 36px rgba(232,48,90,0.55)',
                whiteSpace: 'nowrap',
              }}
            >
              REMOVED
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-0 left-0 right-0 h-36 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />

        <div className="absolute bottom-0 left-0 right-0 h-72 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)' }} />

        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5"
          style={{ paddingTop: '52px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50%',
              width: '38px', height: '38px',
              color: 'white', fontSize: '18px',
              cursor: 'pointer', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            &larr;
          </button>

          <span className="font-display font-bold text-base" style={{ color: 'var(--fav)', textShadow: '0 0 12px rgba(139,92,246,0.5)' }}>
            My Favourites
          </span>

          <div className="rounded-full px-3 py-1 text-xs"
            style={{
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '1px',
              backdropFilter: 'blur(8px)',
            }}>
            {currentIndex + 1} / {posts.length}
          </div>
        </div>

        <div className="absolute z-30 flex flex-col justify-between pointer-events-none"
          style={{ right: '14px', top: '120px', bottom: '190px' }}>
          <span className="text-xs" style={{ color: 'rgba(139,92,246,0.6)', letterSpacing: '1px', writingMode: 'vertical-rl' }}>Next</span>
          <span className="text-xs" style={{ color: 'rgba(139,92,246,0.6)', letterSpacing: '1px', writingMode: 'vertical-rl' }}>Prev</span>
        </div>

        <div className="absolute z-30 px-5" style={{ bottom: '120px', left: 0, right: 0 }}>
          <div className="inline-flex items-center rounded-full px-3 py-1 mb-3 text-xs font-medium"
            style={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.35)',
              color: 'var(--fav)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}>
            {SOURCE_LABELS[currentPost.source] ?? currentPost.source}
            {tag && tag !== currentPost.source ? '  #' + tag : ''}
          </div>
          <p className="font-display text-white text-xl font-bold leading-snug"
            style={{ textShadow: '0 2px 14px rgba(0,0,0,0.85)', fontSize: '20px' }}>
            {currentPost.title}
          </p>
        </div>

        <div className="absolute z-40 flex items-center justify-between px-8"
          style={{ bottom: '28px', left: 0, right: 0 }}>

          <div className="flex flex-col items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.82 }}
              onClick={removeFromFavourites}
              className="action-btn-base btn-dislike"
              style={{ width: '68px', height: '68px' }}
              aria-label="Remove from favourites"
            >
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--dislike)' }}>X</span>
            </motion.button>
            <span className="text-xs tracking-widest uppercase font-semibold"
              style={{ color: 'var(--dislike)', fontSize: '10px' }}>Remove</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              className="action-btn-base btn-fav"
              style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span style={{ fontSize: '28px', color: 'var(--fav)', fontWeight: 'bold' }}>FAV</span>
            </div>
            <span className="text-xs tracking-widest uppercase font-semibold"
              style={{ color: 'var(--fav)', fontSize: '10px' }}>Saved</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.82 }}
              onClick={() => navigate('/')}
              className="action-btn-base btn-like"
              style={{ width: '68px', height: '68px' }}
              aria-label="Back to feed"
            >
              <span style={{ fontSize: '22px', color: 'var(--like)', fontWeight: 'bold' }}>Feed</span>
            </motion.button>
            <span className="text-xs tracking-widest uppercase font-semibold"
              style={{ color: 'var(--like)', fontSize: '10px' }}>Feed</span>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}