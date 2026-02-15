import { useState } from 'react';
import { contentService } from './services/contentService';
import type { Post } from './types/api';

export function TestAPI() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testConnection = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await contentService.getNew(5);
      setPosts(data);
      console.log('Backend connected! Posts:', data);
    } catch (err: any) {
      setError(err.message || 'Connection failed');
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">API Connection Test</h1>
      <button
        onClick={testConnection}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
      >
        Test Backend Connection
      </button>
      
      {loading && <p className="mt-4 text-gray-600">Loading...</p>}
      {error && <p className="mt-4 text-red-600">Error: {error}</p>}
      
      {posts.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-3">Posts from Backend:</h2>
          {posts.map((post) => (
            <div key={post.id} className="border border-gray-300 p-4 mb-3 rounded">
              <p className="font-medium">{post.title}</p>
              <p className="text-sm text-gray-600">Source: {post.source}</p>
              <p className="text-sm text-gray-600">Type: {post.content_type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
