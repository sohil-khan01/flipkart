import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Verify token with backend
    fetchUserData(token);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(`/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Flipkart</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, <strong>{user?.name}</strong></span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Flipkart</h2>
          <p className="text-gray-600 text-lg mb-4">
            You are successfully logged in!
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Profile</h3>
            <p className="text-gray-700"><strong>Name:</strong> {user?.name}</p>
            <p className="text-gray-700"><strong>Email:</strong> {user?.email}</p>
            <p className="text-gray-700"><strong>Role:</strong> {user?.role || 'User'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
