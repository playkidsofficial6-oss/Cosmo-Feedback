
import type { Patient } from '../services/db';

interface Props {
  patient: Patient;
  appointment?: any;
}

const TYPE_BADGE: Record<string, string> = {
  VIP:                'badge-vip',
  Celebrity:          'badge-celeb',
  Regular:            'badge-regular',
  'First Time Visitor':'badge-new',
  'Returning Patient':'badge-regular',
  Referral:           'badge-regular',
  Corporate:          'badge-regular',
};

export function PatientCard({ patient, appointment }: Props) {
  const initials = patient.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const isVip    = patient.patientType === 'VIP' || patient.patientType === 'Celebrity';

  return (
    <div className="patient-card fade-in">
      <div className="patient-header">
        <div className={`patient-avatar ${isVip ? 'vip' : ''}`}>
          {patient.photoUrl
            ? <img src={patient.photoUrl} alt={patient.name} />
            : initials}
        </div>

        <div className="patient-meta">
          <div className="patient-name">{patient.name}</div>
          <div className="patient-phone">{patient.phone}</div>
        </div>

        <span className={`patient-badge ${TYPE_BADGE[patient.patientType] ?? 'badge-regular'}`}>
          {patient.patientType}
        </span>
      </div>

      <div className="patient-grid">
        <div className="patient-field">
          <div className="field-label">Doctor</div>
          <div className="field-value">{appointment?.doctorName || '-'}</div>
        </div>
        <div className="patient-field">
          <div className="field-label">Treatment</div>
          <div className="field-value">{appointment?.treatmentCategory || '-'}</div>
        </div>
        <div className="patient-field">
          <div className="field-label">Date & Time</div>
          <div className="field-value">
            {appointment?.createdAt ? new Date(appointment.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
