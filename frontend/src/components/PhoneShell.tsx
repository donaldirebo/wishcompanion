import { ReactNode } from 'react';

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        .phone-shell-outer {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          
        }
        .phone-shell {
          position: relative;
          width: calc((100vh - 40px) * 9 / 16);
          height: calc(100vh - 40px);
          max-width: 420px;
          border-radius: 48px;
          overflow: hidden;
          box-shadow:
            0 0 0 10px #1c1c1e,
            0 0 0 11px #3a3a3c,
            0 30px 80px rgba(0,0,0,0.9),
            0 0 80px rgba(212,160,23,0.07);
          background: #ffffff;
          flex-shrink: 0;
        }
        .phone-shell::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 30%;
          height: 28px;
          background: #1c1c1e;
          border-radius: 0 0 18px 18px;
          z-index: 9999;
          pointer-events: none;
        }
        .phone-shell::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 48px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
          pointer-events: none;
          z-index: 9999;
        }
        @media (max-width: 420px) {
          .phone-shell-outer {
            background: #ffffff;
          }
          .phone-shell {
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .phone-shell::before,
          .phone-shell::after {
            display: none;
          }
        }
      `}</style>
      <div className="phone-shell-outer">
        <div className="phone-shell">
          {children}
        </div>
      </div>
    </>
  );
}


