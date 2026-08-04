import { useAppContext } from '../contexts/AppContext';
import { PatientCard } from '../components/PatientCard';
import { ReviewForm } from '../components/ReviewForm';
import { QRCodeGenerator } from '../components/QRCodeGenerator';

export function DashboardPage() {
  const {
    activePatient, setActivePatient,
    activeAppointment,
    appointments,
    pendingQueue, completedToday,
    toast,
    handleSave,
    setShowAppointmentModal, setShowRegisterModal,
    reviewUrl,
  } = useAppContext();

  return (
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
                <div className="q-avatar">
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
              <div className="sidebar-section-title">Done Today</div>
              {completedToday.map(p => {
                const initials = p.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                return (
                  <div
                    key={p.id}
                    className={`queue-item ${activePatient?.id === p.id ? 'active' : ''}`}
                    onClick={() => setActivePatient(p)}
                    style={{ opacity: 0.55 }}
                  >
                    <div className="q-avatar">
                      {p.photoUrl ? <img src={p.photoUrl} alt={p.name} /> : initials}
                    </div>
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
              <QRCodeGenerator reviewUrl={reviewUrl} />
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
  );
}
