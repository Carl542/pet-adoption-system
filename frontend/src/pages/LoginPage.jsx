import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/authService';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@shelter.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Login attempt with:', { email, password }); // Debug log

    try {
      const { user, error: loginError } = await adminLogin(email, password);

      console.log('Login response:', { user, error: loginError }); // Debug log

      if (loginError) {
        setError(loginError);
      } else if (user) {
        console.log('Login successful, navigating to admin'); // Debug log
        navigate('/admin');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err); // Debug log
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🐾 Admin Login
          </h1>
          <p className="text-gray-600">Pet Adoption Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@shelter.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-500 text-center">
            Email: admin@shelter.com<br />
            Password: admin123
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Not an admin?</p>
          <button
            onClick={() => navigate('/user-login')}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            User Login →
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:text-blue-600"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;