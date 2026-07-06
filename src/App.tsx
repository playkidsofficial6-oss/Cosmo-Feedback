import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import useSWR from 'swr';
import { api, fetcher } from './services/api';
import type { Patient } from './services/db';
import { getDoctorList, getTreatmentList } from './services/db';
import { Login }            from './components/Login';
import { PatientCard }      from './components/PatientCard';
import { ReviewForm }       from './components/ReviewForm';
import { QRCodeGenerator }  from './components/QRCodeGenerator';
import { Dashboard }        from './components/Dashboard';
import { SearchSystem }     from './components/SearchSystem';

type View = 'checkout' | 'directory' | 'dashboard';

function MainApp() {
  const navigate = useNavigate();
  const userCookie = Cookies.get('user');
  const user = userCookie ? JSON.parse(userCookie) : null;
  const role = user?.role;
  const staffName = user?.name;

  const [view, setView] = useState<View>(role === 'reception' ? 'checkout' : 'dashboard');
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [reviewUrl, setReviewUrl] = useState(
    'https://search.google.com/local/writereview?placeid=ChIJiQ139bN1RDkR8eKj2_tD_r0'
  );

  const { data: patients = [], mutate } = useSWR<Patient[]>('/patients', fetcher);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName,      setNewName]      = useState('');
  const [newPhone,     setNewPhone]     = useState('');
  const [newType,      setNewType]      = useState<Patient['patientType']>('First Time Visitor');
  const [newDoctor,    setNewDoctor]    = useState('');
  const [newCategory,  setNewCategory]  = useState('');

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!activePatient && patients.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const first = patients.find(p => p.visitDate === todayStr && p.reviewStatus === 'Pending')
                  ?? patients.find(p => p.reviewStatus === 'Pending');
      if (first) setActivePatient(first);
    }
  }, [patients, activePatient]);

  if (!user) return null;

  const handleLogout = () => {
    Cookies.remove('user');
    navigate('/');
  };

  const handleSave = async (id: string, updates: Partial<Patient>) => {
    const res = await api.put(`/patients/${id}`, { ...updates, checkoutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    const updated = res.data;
    await mutate();
    showToast(`Check-out saved — ${updated.name}`);
    
    // Attempt to set next patient
    const todayStr = new Date().toISOString().split('T')[0];
    const freshDb = await fetcher('/patients');
    const next = freshDb.find((p: any) => p.visitDate === todayStr && p.reviewStatus === 'Pending' && p.id !== id)
              ?? freshDb.find((p: any) => p.reviewStatus === 'Pending' && p.id !== id);
    setActivePatient(next ?? updated);
  };

  const handleReset = async () => {
    await api.post('/patients/reset');
    await mutate();
    setActivePatient(null);
    showToast('Demo data reset.');
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    const doctors    = getDoctorList();
    const treatments = getTreatmentList();
    
    const res = await api.post('/patients', {
      name: newName,
      phone: newPhone,
      doctorName: newDoctor || doctors[0],
      treatmentCategory: newCategory || treatments[0],
      patientType: newType,
      photoUrl: null,
      reviewStatus: 'Pending',
      reviewStars: null,
      reviewNotes: null,
      marketingSource: null,
      treatmentInterest: [newCategory || treatments[0]],
      purchaseStatus: 'Consultation Only',
      vipTags: newType === 'VIP' || newType === 'Celebrity' ? [newType] : [],
      quickNotes: null,
    });
    
    const created = res.data;
    await mutate();
    setActivePatient(created);
    setShowAddModal(false);
    setNewName(''); setNewPhone(''); setNewDoctor(''); setNewCategory('');
    setNewType('First Time Visitor');
    setView('checkout');
    showToast(`${created.name} added to queue.`);
  };

  const todayStr             = new Date().toISOString().split('T')[0];
  const pendingQueue         = patients.filter(p => p.visitDate === todayStr && p.reviewStatus === 'Pending');
  const completedToday       = patients.filter(p => p.visitDate === todayStr && p.reviewStatus !== 'Pending');
  const doctors              = getDoctorList();
  const treatments           = getTreatmentList();

  return (
    <div className="app-shell">
      {/* ── TOPBAR ─────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">C</div>
          <span className="topbar-name">Cosmo Homes</span>
        </div>

        <nav className="topbar-nav">
          <button id="nav-checkout"  className={`nav-pill ${view === 'checkout'   ? 'active' : ''}`} onClick={() => setView('checkout')}>
            Check-out
          </button>
          <button id="nav-directory" className={`nav-pill ${view === 'directory'  ? 'active' : ''}`} onClick={() => setView('directory')}>
            Directory
          </button>
          {(role === 'manager' || role === 'admin') && (
            <button id="nav-dashboard" className={`nav-pill ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
              Analytics
            </button>
          )}
        </nav>

        <div className="topbar-right">
          <span className="role-chip">{role}</span>
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{staffName}</span>
          <button id="btn-logout" className="btn-icon" title="Log Out" onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── WORKSPACE ──────────────────────────────────────── */}
      <div className="workspace">
        {view === 'checkout' && (
          <>
            <aside className="queue-panel">
              <div className="panel-header">
                <div className="panel-title">Today's Queue</div>
                <div className="panel-count">{pendingQueue.length}</div>
              </div>

              <div className="queue-list">
                {pendingQueue.length === 0 && (
                  <div className="empty-state" style={{ padding: '24px 12px' }}>
                    <p>Queue is clear for today</p>
                  </div>
                )}
                {pendingQueue.map(p => {
                  const isVip = p.patientType === 'VIP' || p.patientType === 'Celebrity';
                  const initials = p.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                  return (
                    <div
                      key={p.id}
                      id={`queue-item-${p.id}`}
                      className={`queue-item ${activePatient?.id === p.id ? 'active' : ''}`}
                      onClick={() => setActivePatient(p)}
                    >
                      <div className={`q-avatar`}>
                        {p.photoUrl ? <img src={p.photoUrl} alt={p.name} /> : initials}
                      </div>
                      <div className="q-info">
                        <div className="q-name">{p.name}</div>
                        <div className="q-sub">{p.doctorName}</div>
                      </div>
                      {isVip && <span className="vip-dot" />}
                    </div>
                  );
                })}

                {completedToday.length > 0 && (
                  <>
                    <div style={{ padding: '12px 10px 6px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)' }}>
                      Done Today
                    </div>
                    {completedToday.map(p => {
                      const initials = p.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                      return (
                        <div
                          key={p.id}
                          className={`queue-item ${activePatient?.id === p.id ? 'active' : ''}`}
                          onClick={() => setActivePatient(p)}
                          style={{ opacity: 0.55 }}
                        >
                          <div className="q-avatar">{p.photoUrl ? <img src={p.photoUrl} alt={p.name}/> : initials}</div>
                          <div className="q-info">
                            <div className="q-name">{p.name}</div>
                            <div className="q-sub" style={{ color: p.reviewStatus === 'Yes' ? 'var(--green)' : 'var(--red)' }}>
                              {p.reviewStatus === 'Yes' ? '★ Reviewed' : '✕ Declined'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              <div className="panel-footer">
                <button id="btn-add-patient" className="btn-add" onClick={() => setShowAddModal(true)}>
                  + Register Walk-In
                </button>
              </div>
            </aside>

            <div className="checkout-area">
              {activePatient ? (
                <>
                  <div className="checkout-left">
                    {toast && (
                      <div className="toast" style={{ marginBottom: 4 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {toast}
                      </div>
                    )}
                    <PatientCard patient={activePatient} />
                    <ReviewForm patient={activePatient} onSave={handleSave} />
                  </div>
                  <div className="checkout-right">
                    <QRCodeGenerator
                      reviewUrl={reviewUrl}
                      onUrlChange={setReviewUrl}
                      patientName={activePatient.name}
                    />
                  </div>
                </>
              ) : (
                <div className="no-selection" style={{ flex: 1 }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <p>Select a patient from the queue to begin check-out</p>
                </div>
              )}
            </div>
          </>
        )}

        {view === 'directory' && (
          <SearchSystem
            patients={patients}
            activePatientId={activePatient?.id}
            onSelectPatient={(p) => {
              setActivePatient(p);
              setView('checkout');
            }}
          />
        )}

        {view === 'dashboard' && (
          <Dashboard onResetDb={handleReset} patients={patients} />
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Register Walk-In</div>
            <div className="modal-sub">Add a patient to today's check-out queue</div>

            <form onSubmit={handleAddPatient}>
              <label className="form-label">Full Name *</label>
              <input id="modal-name" className="form-control" placeholder="e.g. Priya Kapoor" value={newName}
                onChange={e => setNewName(e.target.value)} required />

              <label className="form-label">Phone Number *</label>
              <input id="modal-phone" className="form-control" placeholder="+91 98xx xxxxxx" value={newPhone}
                onChange={e => setNewPhone(e.target.value)} required />

              <label className="form-label">Consulting Doctor</label>
              <select id="modal-doctor" className="form-control" value={newDoctor}
                onChange={e => setNewDoctor(e.target.value)}>
                {doctors.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <label className="form-label">Treatment Category</label>
              <select id="modal-category" className="form-control" value={newCategory}
                onChange={e => setNewCategory(e.target.value)}>
                {treatments.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <label className="form-label">Patient Type</label>
              <select id="modal-type" className="form-control" value={newType}
                onChange={e => setNewType(e.target.value as Patient['patientType'])}>
                <option value="First Time Visitor">First Time Visitor</option>
                <option value="Returning Patient">Returning Patient</option>
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Celebrity">Celebrity</option>
                <option value="Referral">Referral</option>
                <option value="Corporate">Corporate</option>
              </select>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button id="modal-submit" type="submit" className="btn-save" style={{ flex: 1 }}>
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<MainApp />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
