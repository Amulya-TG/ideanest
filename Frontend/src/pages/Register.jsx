import { useState, useEffect } from 'react';
import API from '../api/axios';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]  = useState(false);
  const [error, setError]    = useState('');

  useEffect(() => { document.title = 'Register | IdeaNest'; }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('users/register/', { username, password });
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.username?.[0] || 'Registration failed. Try a different username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Idea<span>Nest</span></div>
        <h2>Create account</h2>
        <p className="auth-subtitle">Join IdeaNest and start sharing your ideas</p>

        <form onSubmit={handleRegister}>
          <div className="auth-field">
            <label>Username</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <a href="/">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
