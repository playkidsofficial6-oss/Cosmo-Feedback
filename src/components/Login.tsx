import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { api } from '../services/api';

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
      <div className="login-card fade-in">
        <div className="login-logo">C</div>
        <h1 className="login-title">Cosmo Homes</h1>
        <p className="login-sub">Review Concierge</p>

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
  );
}
