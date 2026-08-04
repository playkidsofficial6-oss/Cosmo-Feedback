import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../services/api';

const registerPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  gender: z.string().optional(),
  age: z.string().optional(),
  streetAddress1: z.string().optional(),
  streetAddress2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  patientType: z.string().optional(),
  note: z.string().optional(),
});

type RegisterPatientFormData = z.infer<typeof registerPatientSchema>;

interface RegisterPatientModalProps {
  onClose: () => void;
  onSuccess: (patientId: string, patientName: string) => void;
}

export const RegisterPatientModal: React.FC<RegisterPatientModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPatientFormData>({
    resolver: zodResolver(registerPatientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      gender: '',
      age: '',
      streetAddress1: '',
      streetAddress2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      patientType: 'Regular',
      note: '',
    },
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (data: RegisterPatientFormData) => {
    setLoading(true);
    try {
      const newPatientData = {
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        email: data.email || null,
        gender: data.gender || null,
        age: data.age || null,
        streetAddress1: data.streetAddress1 || null,
        streetAddress2: data.streetAddress2 || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country || null,
        patientType: data.patientType || 'Regular',
        note: data.note || null,
        reviewStatus: 'Pending',
        purchaseStatus: 'No Purchase',
      };

      const response = await api.post('/patients', newPatientData);
      const created = response.data;

      onSuccess(created.id, created.name);
    } catch (error) {
      showToast('Error registering patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', width: "100%" }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">Register Patient</div>
        <div className="modal-sub">Add a patient to the system</div>

        {toast && <div className="toast" style={{ marginBottom: 16 }}>{toast}</div>}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label className="form-label">First Name *</label>
              <input className="form-control" placeholder="Jane" {...register('firstName')} />
              {errors.firstName && <span style={{ color: 'red', fontSize: '12px' }}>{errors.firstName.message}</span>}
            </div>
            <div>
              <label className="form-label">Last Name *</label>
              <input className="form-control" placeholder="Doe" {...register('lastName')} />
              {errors.lastName && <span style={{ color: 'red', fontSize: '12px' }}>{errors.lastName.message}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label className="form-label">Phone Number</label>
              <input className="form-control" placeholder="+91..." {...register('phone')} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-control" placeholder="jane@example.com" {...register('email')} />
              {errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{errors.email.message}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label className="form-label">Gender</label>
              <select className="form-control" {...register('gender')}>
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Age</label>
              <input type="number" className="form-control" placeholder="e.g. 30" {...register('age')} />
            </div>
          </div>

          <div>
            <label className="form-label">Street Address (Line 1)</label>
            <input className="form-control" placeholder="123 Main St" {...register('streetAddress1')} />
          </div>

          <div>
            <label className="form-label">Street Address (Line 2) (Optional)</label>
            <input className="form-control" placeholder="Apt 4B" {...register('streetAddress2')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label className="form-label">City / Town</label>
              <input className="form-control" {...register('city')} />
            </div>
            <div>
              <label className="form-label">State / Province / Region</label>
              <input className="form-control" placeholder="Kerala" {...register('state')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label className="form-label">Postal / ZIP Code</label>
              <input className="form-control" placeholder="679329" {...register('postalCode')} />
            </div>
            <div>
              <label className="form-label">Country</label>
              <input className="form-control" {...register('country')} />
            </div>
            <div>
              <label className="form-label">Patient Type</label>
              <select className="form-control" {...register('patientType')}>
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Celebrity">Celebrity</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Note</label>
            <textarea className="form-control" placeholder="Additional details..." rows={2} style={{ resize: 'vertical' }} {...register('note')} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
