import React, { useState } from 'react';

interface Props {
  onLogin: (role: 'reception' | 'manager' | 'admin', name: string) => void;
}

const ROLES = [
  { key: 'reception' as const, label: 'Reception', pin: '1234', name: 'Receptionist' },
  { key: 'manager'  as const, label: 'Manager',   pin: '5678', name: 'Clinic Manager' },
  { key: 'admin'    as const, label: 'Admin',      pin: '0000', name: 'Admin'          },
];

export function Login({ onLogin }: Props) {
  const [roleIdx, setRoleIdx] = useState(0);
  const [pin, setPin]         = useState('');
  const [error, setError]     = useState('');

  const role = ROLES[roleIdx];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === role.pin) {
      onLogin(role.key, role.name);
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleQuick = (idx: number) => {
    const r = ROLES[idx];
    onLogin(r.key, r.name);
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

        <p className="login-divider">Quick Access (Demo)</p>
        <div className="quick-logins">
          {ROLES.map((r, i) => (
            <button key={r.key} id={`quick-${r.key}`} className="quick-btn" onClick={() => handleQuick(i)}>
              <span>{r.label}</span>
              <span>PIN: {r.pin}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
