import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { RegisterPatientModal } from './RegisterPatientModal';
import { EditPatientModal } from './EditPatientModal';
import { AppointmentModal } from './AppointmentModal';
import { DoctorModal } from './DoctorModal';
import { ConfirmModal } from './ConfirmModal';

export function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    role, handleLogout,
    // Modal state
    showRegisterModal, setShowRegisterModal,
    showAppointmentModal, setShowAppointmentModal,
    showDoctorModal, setShowDoctorModal,
    showEditPatientModal, setShowEditPatientModal,
    confirmConfig, setConfirmConfig, confirmLoading,
    // Modal data
    patients, allDoctors,
    preselectedPatientId, setPreselectedPatientId,
    doctorToEdit,
    patientToEdit, setPatientToEdit,
    // Handlers
    mutatePatients, mutateAppointments,
    handleSaveDoctor,
    showToast,
  } = useAppContext();

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
          <button
            id="nav-checkout"
            className={`nav-pill ${pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
          <button
            id="nav-directory"
            className={`nav-pill ${pathname === '/directory' ? 'active' : ''}`}
            onClick={() => navigate('/directory')}
          >
            Directory
          </button>
          <button
            id="nav-appointments"
            className={`nav-pill ${pathname === '/appointments' ? 'active' : ''}`}
            onClick={() => navigate('/appointments')}
          >
            Appointments
          </button>
          {(role === 'manager' || role === 'admin') && (
            <button
              id="nav-dashboard"
              className={`nav-pill ${pathname === '/analytics' ? 'active' : ''}`}
              onClick={() => navigate('/analytics')}
            >
              Analytics
            </button>
          )}
        </nav>

        <div className="topbar-right">
          <span className="role-chip">{role}</span>
          <button id="btn-logout" className="btn-icon" title="Log Out" onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── WORKSPACE — Outlet renders the matched page ──── */}
      <div className="workspace">
        <Outlet />
      </div>

      {/* ── GLOBAL MODALS ──────────────────────────────────── */}
      {showRegisterModal && (
        <RegisterPatientModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={(patientId, patientName) => {
            mutatePatients();
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
          onAppointmentCreated={() => {
            mutatePatients();
            mutateAppointments();
            setShowAppointmentModal(false);
            setPreselectedPatientId(null);
          }}
        />
      )}

      {showDoctorModal && (
        <DoctorModal
          initialData={doctorToEdit}
          onClose={() => setShowDoctorModal(false)}
          onSave={handleSaveDoctor}
        />
      )}

      {showEditPatientModal && patientToEdit && (
        <EditPatientModal
          patient={patientToEdit}
          onClose={() => { setShowEditPatientModal(false); setPatientToEdit(null); }}
          onSuccess={() => {
            mutatePatients();
            setShowEditPatientModal(false);
            showToast(`${patientToEdit.name} updated successfully.`);
            setPatientToEdit(null);
          }}
        />
      )}

      {confirmConfig && (
        <ConfirmModal
          isOpen={true}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          variant={confirmConfig.variant}
          loading={confirmLoading}
          onConfirm={confirmConfig.onConfirm}
          onClose={() => setConfirmConfig(null)}
        />
      )}
    </div>
  );
}
