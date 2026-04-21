import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login }      from './pages/Login';
import { Register }   from './pages/Register';
import { Home }       from './pages/Home';
import { Profile }    from './pages/Profile';
import { Favourites } from './pages/Favourites';
import { MyMedia }    from './pages/MyMedia';

// Protect routes — redirect to /login if not authenticated
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-5"
        style={{ background: 'var(--bg)' }}>
        <div className="text-5xl" style={{ animation: 'float 2.5s ease-in-out infinite' }}>✨</div>
        <p className="font-display text-xl gradient-gold">WishScroll</p>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--gold)', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

// Redirect to home if already logged in
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"      element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"   element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/"           element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/profile"    element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/my-media"   element={<PrivateRoute><MyMedia /></PrivateRoute>} />
      <Route path="/favourites" element={<PrivateRoute><Favourites /></PrivateRoute>} />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}