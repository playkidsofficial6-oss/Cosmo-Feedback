import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../services/api';
import { getTreatmentList } from '../services/db';
import type { Patient } from '../services/db';

const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  treatmentCategory: z.string().min(1, 'Treatment Category is required'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
  patients: Patient[];
  allDoctors: any[];
  onClose: () => void;
  onOpenAddPatient: () => void;
  preselectedPatientId?: string | null;
  onAppointmentCreated?: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  patients,
  allDoctors,
  onClose,
  onOpenAddPatient,
  preselectedPatientId,
  onAppointmentCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: preselectedPatientId || '',
      doctorId: allDoctors.length > 0 ? allDoctors[0]._id : '',
      treatmentCategory: getTreatmentList()[0],
      notes: '',
    },
  });

  const selectedPatientId = watch('patientId');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (preselectedPatientId) {
      setValue('patientId', preselectedPatientId);
    }
  }, [preselectedPatientId, setValue]);

  useEffect(() => {
    if (selectedPatientId) {
      const p = patients.find(p => p.id === selectedPatientId);
      if (p) setSearchQuery(p.name);
    } else {
      setSearchQuery('');
    }
  }, [selectedPatientId, patients]);

  const filteredPatients = patients
    .filter(p => {
      const query = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(query) || (p.pid && p.pid.toString().includes(query));
    })
    .slice(0, 10);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (data: AppointmentFormData) => {
    const patient = patients.find((p) => p.id === data.patientId);
    if (!patient) return showToast('Patient not found');

    setLoading(true);
    try {
      await api.post('/appointments', {
        patient: patient.id,
        doctor: data.doctorId,
        treatmentCategory: data.treatmentCategory,
        notes: data.notes,
        status: 'Scheduled',
      });

      showToast('Appointment Scheduled!');
      if (onAppointmentCreated) onAppointmentCreated();
      onClose();
    } catch (error) {
      showToast('Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-title">Make Appointment</div>
        <div className="modal-sub">Select an existing patient or create a new one</div>

        {toast && (
          <div className="toast" style={{ marginBottom: 16 }}>
            {toast}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <label className="form-label">Patient *</label>
                <input
                  className="form-control"
                  placeholder="Search patient name"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setIsDropdownOpen(false)}
                />
                <input type="hidden" {...register('patientId')} />

                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px',
                    maxHeight: '200px', overflowY: 'auto', zIndex: 50, boxShadow: 'var(--shadow-md)', marginTop: '4px'
                  }}>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map(p => (
                        <div
                          key={p.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setValue('patientId', p.id, { shouldValidate: true });
                            setSearchQuery(p.name);
                            setIsDropdownOpen(false);
                          }}
                          style={{
                            padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '13px'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {p.name}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--ink-3)' }}>No patients found</div>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={onOpenAddPatient}
                style={{ height: '40px', whiteSpace: 'nowrap' }}
              >
                + Create Patient
              </button>
            </div>
            {errors.patientId && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.patientId.message}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Doctor *</label>
              <select className="form-control" {...register('doctorId')}>
                {allDoctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.doctorId && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.doctorId.message}</p>}
            </div>
            <div>
              <label className="form-label">Treatment Category *</label>
              <select className="form-control" {...register('treatmentCategory')}>
                {getTreatmentList().map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.treatmentCategory && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.treatmentCategory.message}</p>}
            </div>
          </div>

          <div>
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              placeholder="Any additional notes..."
              rows={3}
              style={{ resize: 'vertical' }}
              {...register('notes')}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Scheduling...' : 'Make Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
