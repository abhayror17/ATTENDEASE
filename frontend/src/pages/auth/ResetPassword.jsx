import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { Lock, Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    new_password: '',
    new_password2: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.new_password !== formData.new_password2) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await authApi.confirmPasswordReset(token, formData.new_password, formData.new_password2);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        const errorMessages = Object.values(errors).flat().join('. ');
        setError(errorMessages || 'Failed to reset password. Please try again.');
      } else {
        setError('Failed to reset password. The link may have expired.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo success">
                <CheckCircle size={32} />
              </div>
              <h1>Password Changed!</h1>
              <p>Your password has been reset successfully. Redirecting to login...</p>
            </div>
            <div className="auth-footer">
              <p>
                <Link to="/login" className="auth-link">
                  Go to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo" style={{ background: 'var(--gradient-accent)' }}>
                <KeyRound size={32} />
              </div>
              <h1>Invalid Link</h1>
              <p>This password reset link is invalid or has expired.</p>
            </div>
            <div className="auth-footer">
              <p>
                <Link to="/forgot-password" className="auth-link">
                  Request a new reset link
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <KeyRound size={32} />
            </div>
            <h1>Reset Your Password</h1>
            <p>Enter your new password below</p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="new_password2"
                  value={formData.new_password2}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-btn"
              disabled={loading}
            >
              {loading ? 'Resetting password...' : 'Reset Password'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Remember your password?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;