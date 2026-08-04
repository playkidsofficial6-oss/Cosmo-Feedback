import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { api, setAccessToken } from '../services/api';

const ROLES = [
  { key: 'reception' as const, label: 'Reception', name: 'Receptionist' },
  { key: 'manager'  as const, label: 'Manager',   name: 'Clinic Manager' },
  { key: 'admin'    as const, label: 'Admin',      name: 'Admin'          },
];

export function Login() {
  const [roleIdx, setRoleIdx] = useState(0);
  const [pin, setPin]         = useState('');
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const role = ROLES[roleIdx];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', {
        username: role.key,
        password: pin
      });
      
      if (response.data && response.data.user) {
        setAccessToken(response.data.accessToken);
        Cookies.set('user', JSON.stringify({ ...response.data.user, name: role.name }), { expires: 1 });
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  return (
    <div className="login-shell">
      <div className="login-container">
        
        {/* Left Informational Side */}
        <div className="login-left fade-in">
          <img src="/logo.svg" alt="Cosmo" className="login-logo-large" />
          <h1 className="login-hero-title">Experience True<br/>Luxury & Care.</h1>
          <p className="login-hero-desc">
            Welcome to the Cosmo Home Skin Care Centre management suite. 
            Sign in to securely access patient records, manage appointments, and elevate your clinic operations.
          </p>
        </div>

        {/* Right Login Card Side */}
        <div className="login-right fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="login-card">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-sub">Select your account role</p>

        {/* Role Selector */}
        <div className="role-tabs">
          {ROLES.map((r, i) => (
            <button
              key={r.key}
              className={`role-tab ${roleIdx === i ? 'active' : ''}`}
              onClick={() => { setRoleIdx(i); setPin(''); setError(''); }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* PIN Entry */}
        <form onSubmit={handleSubmit}>
          <label className="login-label">Enter PIN</label>
          <input
            id="pin-input"
            type="password"
            className="login-input"
            placeholder="••••"
            maxLength={6}
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(''); }}
            autoFocus
          />
          <p className="login-error">{error}</p>
          <button type="submit" id="btn-login" className="btn-login">
            Sign In
          </button>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
}
