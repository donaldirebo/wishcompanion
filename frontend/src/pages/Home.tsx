import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Welcome to Wishscroll</h1>
              <p className="text-gray-600">Hello, {user?.name || user?.email}!</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Coming Soon!</h2>
          <p className="text-gray-700">
            Content swiper will be here (Issue #33)
          </p>
        </div>
      </div>
    </div>
  );
}
