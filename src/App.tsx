import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import useSWR from 'swr';
import { api, fetcher } from './services/api';
import type { Patient } from './services/db';

import { Login } from './components/Login';
import { PatientCard } from './components/PatientCard';
import { ReviewForm } from './components/ReviewForm';
import { QRCodeGenerator } from './components/QRCodeGenerator';
import { Dashboard } from './components/Dashboard';
import { SearchSystem } from './components/SearchSystem';
import { RegisterPatientModal } from './components/RegisterPatientModal';
import { AppointmentModal } from './components/AppointmentModal';
import { DoctorModal } from './components/DoctorModal';
import { AppointmentsView } from './components/AppointmentsView';

type View = 'checkout' | 'directory' | 'appointments' | 'dashboard';

function MainApp() {
  const navigate = useNavigate();
  const userCookie = Cookies.get('user');
  const user = userCookie ? JSON.parse(userCookie) : null;
  const role = user?.role;


  const [view, setView] = useState<View>(role === 'reception' ? 'checkout' : 'dashboard');
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [reviewUrl] = useState(
    'https://g.page/r/CRrsj4jmltT8EBM/review'
  );

  const { data: patients = [], mutate } = useSWR<Patient[]>('/patients', fetcher);
  const { data: appointments = [], mutate: mutateAppointments } = useSWR<any[]>('/appointments', fetcher);
  const { data: allDoctors = [], mutate: mutateDoctors } = useSWR<any[]>('/doctors', fetcher);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [preselectedPatientId, setPreselectedPatientId] = useState<string | null>(null);

  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<any>(null);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysPatientIds = useMemo(() => new Set(
    appointments
      .filter(a => a.createdAt && a.createdAt.startsWith(todayStr))
      .map(a => a.patient?.id || a.patient?._id || a.patient)
  ), [appointments, todayStr]);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!activePatient && patients.length > 0) {
      const first = patients.find(p => todaysPatientIds.has(p.id) && p.reviewStatus === 'Pending')
        ?? patients.find(p => p.reviewStatus === 'Pending');
      if (first) setActivePatient(first);
    }
  }, [patients, appointments, activePatient, todaysPatientIds]);

  const activeAppointment = useMemo(() => {
    if (!activePatient) return null;
    return appointments
      .filter(a => (a.patient?.id || a.patient?._id || a.patient) === activePatient.id)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
  }, [activePatient, appointments]);

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
    const freshDb = await fetcher('/patients');
    const next = freshDb.find((p: any) => todaysPatientIds.has(p.id) && p.reviewStatus === 'Pending' && p.id !== id)
      ?? freshDb.find((p: any) => p.reviewStatus === 'Pending' && p.id !== id);
    setActivePatient(next ?? updated);
  };

  const handleAddDoctor = () => {
    setDoctorToEdit(null);
    setShowDoctorModal(true);
  };

  const handleEditDoctor = (doc: any) => {
    setDoctorToEdit(doc);
    setShowDoctorModal(true);
  };

  const handleSaveDoctor = async (data: any) => {
    if (doctorToEdit) {
      await api.put(`/doctors/${doctorToEdit._id}`, data);
      showToast(`Doctor updated to: ${data.name}`);
    } else {
      await api.post('/doctors', data);
      showToast(`Doctor added: ${data.name}`);
    }
    await mutateDoctors();
    setShowDoctorModal(false);
  };

  const handleDeleteDoctor = async (docId: string) => {
    if (!window.confirm("Are you sure you want to remove this doctor?")) return;
    await api.put(`/doctors/${docId}`, { isDeleted: true });
    await mutateDoctors();
    showToast(`Doctor removed.`);
  };

  const pendingQueue = patients.filter(p => todaysPatientIds.has(p.id) && p.reviewStatus === 'Pending');
  const completedToday = patients.filter(p => todaysPatientIds.has(p.id) && p.reviewStatus !== 'Pending');

  return (
    <div className="app-shell">
      <div className="workspace-bg-blobs">
        <div className="bg-blob blob-1"></div>
        <div className="bg-blob blob-2"></div>
        <div className="bg-blob blob-3"></div>
      </div>

      {/* ── TOPBAR ─────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-brand">
          <img src="/logo.svg" alt="Cosmo Home Skin Care Centre" className="topbar-logo-img" />
          <span className="topbar-name">Cosmo Home</span>
        </div>

        <nav className="topbar-nav">
          <button id="nav-checkout" className={`nav-pill ${view === 'checkout' ? 'active' : ''}`} onClick={() => setView('checkout')}>
            Dashboard
          </button>
          <button id="nav-directory" className={`nav-pill ${view === 'directory' ? 'active' : ''}`} onClick={() => setView('directory')}>
            Directory
          </button>
          <button id="nav-appointments" className={`nav-pill ${view === 'appointments' ? 'active' : ''}`} onClick={() => setView('appointments')}>
            Appointments
          </button>
          {(role === 'manager' || role === 'admin') && (
            <button id="nav-dashboard" className={`nav-pill ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
              Analytics
            </button>
          )}
        </nav>

        <div className="topbar-right">
          <span className="role-chip">{role}</span>
          {/* <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{staffName}</span> */}
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
                  const appts = appointments.filter(a => a.patient && (a.patient.id === p.id || a.patient._id === p.id || a.patient === p.id));
                  const latestAppt = appts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
                  const doctorName = latestAppt?.doctor?.name || '';

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
                        <div className="q-sub">{doctorName}</div>
                      </div>
                      {isVip && <span className="vip-dot" />}
                    </div>
                  );
                })}

                {completedToday.length > 0 && (
                  <>
                    <div className="sidebar-section-title">
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

              <div className="panel-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button id="btn-make-appointment" className="btn-add" onClick={() => setShowAppointmentModal(true)}>
                  Make Appointment
                </button>
                <button id="btn-add-patient" className="btn-add" onClick={() => setShowRegisterModal(true)}>
                  + Register Patient
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
                    <PatientCard key={`card-${activePatient.id}`} patient={activePatient} appointment={activeAppointment} />
                    <ReviewForm key={`form-${activePatient.id}`} patient={activePatient} onSave={handleSave} />
                  </div>
                  <div className="checkout-right">
                    <QRCodeGenerator
                      reviewUrl={reviewUrl}
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
            appointments={appointments}
            activePatientId={activePatient?.id}
            onSelectPatient={(p) => {
              setActivePatient(p);
              setView('checkout');
            }}
          />
        )}

        {view === 'appointments' && (
          <AppointmentsView />
        )}

        {view === 'dashboard' && (
          <Dashboard
            patients={patients}
            appointments={appointments}
            allDoctors={allDoctors}
            onAddDoctor={handleAddDoctor}
            onEditDoctor={handleEditDoctor}
            onDeleteDoctor={handleDeleteDoctor}
          />
        )}
      </div>

      {showRegisterModal && (
        <RegisterPatientModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={(patientId, patientName) => {
            mutate();
            setPreselectedPatientId(patientId);
            setShowRegisterModal(false);
            setShowAppointmentModal(true);
            showToast(`${patientName} registered. Ready to schedule appointment.`);
          }}
        />
      )}

      {showAppointmentModal && (
        <AppointmentModal
          patients={patients}
          allDoctors={allDoctors}
          onClose={() => { setShowAppointmentModal(false); setPreselectedPatientId(null); }}
          onOpenAddPatient={() => { setShowAppointmentModal(false); setShowRegisterModal(true); }}
          preselectedPatientId={preselectedPatientId}
          onAppointmentCreated={() => { mutate(); mutateAppointments(); setShowAppointmentModal(false); setPreselectedPatientId(null); }}
        />
      )}

      {showDoctorModal && (
        <DoctorModal
          initialData={doctorToEdit}
          onClose={() => setShowDoctorModal(false)}
          onSave={handleSaveDoctor}
        />
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
