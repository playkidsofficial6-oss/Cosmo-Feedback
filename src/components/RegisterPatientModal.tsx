import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../services/api';

const registerPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  gender: z.string().optional(),
  age: z.string().optional(),
  streetAddress1: z.string().min(1, 'Street address is required'),
  streetAddress2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  patientType: z.string().min(1, 'Patient type is required'),
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
      city: 'Nilambur',
      state: 'Kerala',
      country: 'India',
      patientType: 'Regular',
      email: '',
      gender: '',
      age: '',
      streetAddress2: '',
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
        phone: data.phone,
        email: data.email || null,
        gender: data.gender || null,
        age: data.age || null,
        streetAddress1: data.streetAddress1,
        streetAddress2: data.streetAddress2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        patientType: data.patientType,
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
              <label className="form-label">Phone Number *</label>
              <input className="form-control" placeholder="+91..." {...register('phone')} />
              {errors.phone && <span style={{ color: 'red', fontSize: '12px' }}>{errors.phone.message}</span>}
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
            <label className="form-label">Street Address (Line 1) *</label>
            <input className="form-control" placeholder="123 Main St" {...register('streetAddress1')} />
            {errors.streetAddress1 && <span style={{ color: 'red', fontSize: '12px' }}>{errors.streetAddress1.message}</span>}
          </div>

          <div>
            <label className="form-label">Street Address (Line 2) (Optional)</label>
            <input className="form-control" placeholder="Apt 4B" {...register('streetAddress2')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label className="form-label">City / Town *</label>
              <input className="form-control" {...register('city')} />
              {errors.city && <span style={{ color: 'red', fontSize: '12px' }}>{errors.city.message}</span>}
            </div>
            <div>
              <label className="form-label">State / Province / Region *</label>
              <input className="form-control" placeholder="Kerala" {...register('state')} />
              {errors.state && <span style={{ color: 'red', fontSize: '12px' }}>{errors.state.message}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label className="form-label">Postal / ZIP Code *</label>
              <input className="form-control" placeholder="679329" {...register('postalCode')} />
              {errors.postalCode && <span style={{ color: 'red', fontSize: '12px' }}>{errors.postalCode.message}</span>}
            </div>
            <div>
              <label className="form-label">Country *</label>
              <input className="form-control" {...register('country')} />
              {errors.country && <span style={{ color: 'red', fontSize: '12px' }}>{errors.country.message}</span>}
            </div>
            <div>
              <label className="form-label">Patient Type *</label>
              <select className="form-control" {...register('patientType')}>
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Celebrity">Celebrity</option>
              </select>
              {errors.patientType && <span style={{ color: 'red', fontSize: '12px' }}>{errors.patientType.message}</span>}
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
