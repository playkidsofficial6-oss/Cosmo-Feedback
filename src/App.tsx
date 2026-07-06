import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import useSWR from 'swr';
import { api, fetcher } from './services/api';
import type { Patient } from './services/db';
import { getDoctorList, getTreatmentList } from './services/db';
import { Login } from './components/Login';
import { PatientCard } from './components/PatientCard';
import { ReviewForm } from './components/ReviewForm';
import { QRCodeGenerator } from './components/QRCodeGenerator';
import { Dashboard } from './components/Dashboard';
import { SearchSystem } from './components/SearchSystem';

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
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGender, setNewGender] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newStreetAddress1, setNewStreetAddress1] = useState('');
  const [newStreetAddress2, setNewStreetAddress2] = useState('');
  const [newCity, setNewCity] = useState('Nilambur');
  const [newStateLoc, setNewStateLoc] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newCountry, setNewCountry] = useState('India');
  const [newType, setNewType] = useState<Patient['patientType']>('Regular');
  const [newNote, setNewNote] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [newCategory, setNewCategory] = useState('');

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
    if (!newFirstName || !newLastName || !newPhone) return;
    const fullName = `${newFirstName} ${newLastName}`;
    const doctors = getDoctorList();
    const treatments = getTreatmentList();

    const res = await api.post('/patients', {
      name: fullName,
      firstName: newFirstName,
      lastName: newLastName,
      phone: newPhone,
      email: newEmail,
      gender: newGender,
      age: newAge,
      streetAddress1: newStreetAddress1,
      streetAddress2: newStreetAddress2,
      city: newCity,
      state: newStateLoc,
      postalCode: newPostalCode,
      country: newCountry,
      note: newNote,
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
      quickNotes: newNote || null,
    });

    const created = res.data;
    await mutate();
    setActivePatient(created);
    setShowAddModal(false);
    setNewFirstName(''); setNewLastName(''); setNewPhone('');
    setNewEmail(''); setNewGender(''); setNewAge('');
    setNewStreetAddress1(''); setNewStreetAddress2('');
    setNewCity('Nilambur'); setNewStateLoc(''); setNewPostalCode('');
    setNewCountry('India'); setNewNote('');
    setNewType('Regular'); setNewDoctor(''); setNewCategory('');
    setView('checkout');
    showToast(`${created.name} added to queue.`);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingQueue = patients.filter(p => p.visitDate === todayStr && p.reviewStatus === 'Pending');
  const completedToday = patients.filter(p => p.visitDate === todayStr && p.reviewStatus !== 'Pending');
  const doctors = getDoctorList();
  const treatments = getTreatmentList();

  return (
    <div className="app-shell">
      {/* ── TOPBAR ─────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">C</div>
          <span className="topbar-name">Cosmo Homes</span>
        </div>

        <nav className="topbar-nav">
          <button id="nav-checkout" className={`nav-pill ${view === 'checkout' ? 'active' : ''}`} onClick={() => setView('checkout')}>
            Check-out
          </button>
          <button id="nav-directory" className={`nav-pill ${view === 'directory' ? 'active' : ''}`} onClick={() => setView('directory')}>
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
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
                          <div className="q-avatar">{p.photoUrl ? <img src={p.photoUrl} alt={p.name} /> : initials}</div>
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
                          <polyline points="20 6 9 17 4 12" />
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
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
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
          <div className="modal-box" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', width: "100%" }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">Register Walk-In</div>
            <div className="modal-sub">Add a patient to today's check-out queue</div>

            <form onSubmit={handleAddPatient} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">First Name *</label>
                  <input className="form-control" placeholder="e.g. Priya" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Last Name *</label>
                  <input className="form-control" placeholder="e.g. Kapoor" value={newLastName} onChange={e => setNewLastName(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="form-label">Phone Number *</label>
                <input className="form-control" placeholder="+91 98xx xxxxxx" value={newPhone} onChange={e => setNewPhone(e.target.value)} required />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input type="email" className="form-control" placeholder="Optional" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              </div>

              <div>
                <label className="form-label">Gender</label>
                <select className="form-control" value={newGender} onChange={e => setNewGender(e.target.value)}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="form-label">Age</label>
                <input type="number" className="form-control" placeholder="Optional" value={newAge} onChange={e => setNewAge(e.target.value)} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Street Address (Line 1) *</label>
                <input className="form-control" value={newStreetAddress1} onChange={e => setNewStreetAddress1(e.target.value)} required />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Street Address (Line 2) (Optional)</label>
                <input className="form-control" value={newStreetAddress2} onChange={e => setNewStreetAddress2(e.target.value)} />
              </div>

              <div>
                <label className="form-label">City / Town *</label>
                <input className="form-control" value={newCity} onChange={e => setNewCity(e.target.value)} required />
              </div>

              <div>
                <label className="form-label">State / Province / Region *</label>
                <input className="form-control" value={newStateLoc} onChange={e => setNewStateLoc(e.target.value)} required />
              </div>

              <div>
                <label className="form-label">Postal / ZIP Code *</label>
                <input className="form-control" value={newPostalCode} onChange={e => setNewPostalCode(e.target.value)} required />
              </div>

              <div>
                <label className="form-label">Country *</label>
                <input className="form-control" value={newCountry} onChange={e => setNewCountry(e.target.value)} required />
              </div>

              <div>
                <label className="form-label">Patient Type</label>
                <select className="form-control" value={newType} onChange={e => setNewType(e.target.value as any)}>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="Celebrity">Celebrity</option>
                </select>
              </div>

              <div>
                <label className="form-label">Note</label>
                <input className="form-control" placeholder="Optional" value={newNote} onChange={e => setNewNote(e.target.value)} />
              </div>



              <div className="modal-actions" style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
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
