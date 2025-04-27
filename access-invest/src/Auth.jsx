// src/pages/Auth.jsx
import './auth.css';
import React, { useState } from 'react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', location: '', age: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const endpoint = isLogin
      ? 'http://localhost:5000/api/login'
      : 'http://localhost:5000/api/register';
      
    try {
      console.log('Sending request to:', endpoint);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/';
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-header">
          {isLogin ? 'Login to AccessInvest' : 'Create your AccessInvest Account'}
        </h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email"
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Your password"
              required
            />
          </div>

          {/* Only show Location and Age fields when signing up */}
          {!isLogin && (
            <>
              <div>
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Your city, state"
                  required
                />
              </div>
              <div>
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Your age"
                  required
                />
              </div>
            </>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setIsLogin(false)}>Sign Up</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)}>Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}