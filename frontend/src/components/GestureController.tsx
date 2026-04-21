import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GestureControllerProps {
  onLike: () => void;
  onDislike: () => void;
  onToggleMute: () => void;
  onTogglePlay: () => void;
  onClose: () => void;
}

type GestureHint = 'like' | 'mute' | 'play' | null;

// Timing
const GESTURE_COOLDOWN_MS = 1500;
const PANEL_HIDE_DELAY_MS = 10000;

function dist(a: {x:number,y:number}, b: {x:number,y:number}) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function GestureController({ onLike, onDislike, onToggleMute, onTogglePlay, onClose }: GestureControllerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const lastGestureRef = useRef<number>(0);
  const eyesClosedRef = useRef(false);
  const mouthOpenRef = useRef(false);
  const tiltedRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [hint, setHint] = useState<GestureHint>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [panelVisible, setPanelVisible] = useState(true);

  const [debugEAR, setDebugEAR] = useState(0);
  const [debugMAR, setDebugMAR] = useState(0);
  const [debugTilt, setDebugTilt] = useState(0);

  const thresholdRef = useRef({ blink: 0.18, mouth: 0.30, tilt: 0.10 });

  useEffect(() => {
    if (status === 'ready') {
      hideTimerRef.current = setTimeout(() => setPanelVisible(false), PANEL_HIDE_DELAY_MS);
    }
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [status]);

  const flashHint = useCallback((g: GestureHint) => {
    setHint(g);
    setPanelVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setPanelVisible(false), 2000);
    setTimeout(() => setHint(null), 900);
  }, []);

  const triggerGesture = useCallback((type: 'blink' | 'tilt' | 'mouth') => {
    const now = Date.now();
    if (now - lastGestureRef.current < GESTURE_COOLDOWN_MS) return;
    lastGestureRef.current = now;
    if (type === 'blink') { flashHint('like'); onLike(); }
    if (type === 'tilt')  { flashHint('mute'); onToggleMute(); }
    if (type === 'mouth') { flashHint('play'); onTogglePlay(); }
  }, [onLike, onToggleMute, onTogglePlay, flashHint]);

  const processFrame = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current || videoRef.current.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }
    try {
      const faces = await detectorRef.current.estimateFaces(videoRef.current);
      if (faces.length > 0) {
        const kp = faces[0].keypoints as { x: number; y: number }[];
        const get = (i: number) => kp[i];

        const faceWidth = dist(get(234), get(454)) || 1;

        const leftEAR  = dist(get(159), get(145)) / faceWidth;
        const rightEAR = dist(get(386), get(374)) / faceWidth;
        const avgEAR   = (leftEAR + rightEAR) / 2;

        const MAR = dist(get(13), get(14)) / faceWidth;
        const tiltRatio = Math.abs(get(234).y - get(454).y) / faceWidth;

        setDebugEAR(Math.round(avgEAR * 1000) / 1000);
        setDebugMAR(Math.round(MAR * 1000) / 1000);
        setDebugTilt(Math.round(tiltRatio * 1000) / 1000);

        const t = thresholdRef.current;

        // Blink: single blink triggers like immediately
        const eyesClosed = avgEAR < t.blink;
        if (eyesClosed && !eyesClosedRef.current) triggerGesture('blink');
        eyesClosedRef.current = eyesClosed;

        // Mouth open
        const mouthOpen = MAR > t.mouth;
        if (mouthOpen && !mouthOpenRef.current) triggerGesture('mouth');
        mouthOpenRef.current = mouthOpen;

        // Head tilt
        const tilted = tiltRatio > t.tilt;
        if (tilted && !tiltedRef.current) triggerGesture('tilt');
        tiltedRef.current = tilted;
      }
    } catch { /* continue */ }
    rafRef.current = requestAnimationFrame(processFrame);
  }, [triggerGesture]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 320, height: 240 },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const tf = await import('@tensorflow/tfjs');
        await tf.ready();
        const fld = await import('@tensorflow-models/face-landmarks-detection');
        const detector = await fld.createDetector(
          fld.SupportedModels.MediaPipeFaceMesh,
          { runtime: 'tfjs', refineLandmarks: false, maxFaces: 1 }
        );
        if (cancelled) return;
        detectorRef.current = detector;
        setStatus('ready');
        rafRef.current = requestAnimationFrame(processFrame);
      } catch (err: any) {
        if (!cancelled) {
          setStatus('error');
          setErrorMsg(err?.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access.'
            : 'Could not start gesture detection.');
        }
      }
    }
    init();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      detectorRef.current?.dispose?.();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [processFrame]);

  const hintConfig: Record<NonNullable<GestureHint>, { emoji: string; label: string; color: string }> = {
    like: { emoji: '❤️',  label: 'Liked!',       color: 'rgba(0,201,122,1)' },
    mute: { emoji: '🔇',  label: 'Mute toggled', color: 'rgba(212,160,23,1)' },
    play: { emoji: '⏯️', label: 'Play/Pause',   color: 'rgba(176,138,255,1)' },
  };

  // Hidden mode — detection still running, only feedback shown
  if (!panelVisible) {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 200 }}>
        <video ref={videoRef} muted playsInline style={{ display: 'none' }} />
        <AnimatePresence>
          {hint && (
            <motion.div
              key={hint}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: '80px', lineHeight: 1, filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.6))' }}>
                {hintConfig[hint].emoji}
              </span>
              <span style={{
                color: hintConfig[hint].color, fontSize: '16px', fontWeight: 700,
                background: 'rgba(0,0,0,0.7)', borderRadius: '12px', padding: '4px 14px',
              }}>
                {hintConfig[hint].label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Close button */}
      <button onClick={onClose} style={{
        position: 'absolute', top: '48px', right: '20px',
        width: '44px', height: '44px', borderRadius: '50%',
        background: 'rgba(220,40,40,0.2)', border: '1px solid rgba(220,40,40,0.5)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,100,100,1)" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
        👁 Gesture Control
      </p>

      {/* Camera preview */}
      <div style={{
        position: 'relative', width: '200px', height: '150px',
        borderRadius: '16px', overflow: 'hidden',
        border: status === 'ready' ? '2px solid rgba(0,201,122,0.7)' : '2px solid rgba(255,255,255,0.2)',
        marginBottom: '12px',
      }}>
        <video ref={videoRef} muted playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
        {status === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '12px' }}>Starting camera…</span>
          </div>
        )}
        {status === 'ready' && (
          <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,201,122,0.85)', borderRadius: '8px', padding: '2px 10px' }}>
            <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>ACTIVE</span>
          </div>
        )}
      </div>

      {/* Debug values */}
      {status === 'ready' && (
        <div style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '12px', padding: '8px 16px', marginBottom: '12px',
          display: 'flex', gap: '16px',
        }}>
          <span style={{ color: 'rgba(0,201,122,1)', fontSize: '12px', fontFamily: 'monospace' }}>EAR: {debugEAR}</span>
          <span style={{ color: 'rgba(212,160,23,1)', fontSize: '12px', fontFamily: 'monospace' }}>MAR: {debugMAR}</span>
          <span style={{ color: 'rgba(176,138,255,1)', fontSize: '12px', fontFamily: 'monospace' }}>TILT: {debugTilt}</span>
        </div>
      )}

      {status === 'error' && (
        <p style={{ color: 'rgba(255,100,100,1)', fontSize: '13px', textAlign: 'center', maxWidth: '260px', lineHeight: 1.6, marginBottom: '16px' }}>
          {errorMsg}
        </p>
      )}

      {status === 'ready' && (
        <>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '10px', fontStyle: 'italic' }}>
            Panel hides in 10s — gestures keep working
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '280px' }}>
            {[
              { gesture: 'Blink once', action: 'Like ❤️',        color: 'rgba(0,201,122,0.15)',   border: 'rgba(0,201,122,0.4)' },
              { gesture: 'Tilt head',  action: 'Mute/Unmute 🔇', color: 'rgba(212,160,23,0.15)',  border: 'rgba(212,160,23,0.4)' },
              { gesture: 'Open mouth', action: 'Play/Pause ⏯️', color: 'rgba(176,138,255,0.15)', border: 'rgba(176,138,255,0.4)' },
            ].map(row => (
              <div key={row.gesture} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: row.color, border: `1px solid ${row.border}`,
                borderRadius: '12px', padding: '10px 14px',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 600 }}>{row.gesture}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{row.action}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {hint && (
          <motion.div
            key={hint}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              position: 'absolute', top: '32%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: '72px', lineHeight: 1, filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.6))' }}>
              {hintConfig[hint].emoji}
            </span>
            <span style={{
              color: hintConfig[hint].color, fontSize: '16px', fontWeight: 700,
              background: 'rgba(0,0,0,0.6)', borderRadius: '12px', padding: '4px 14px',
            }}>
              {hintConfig[hint].label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}