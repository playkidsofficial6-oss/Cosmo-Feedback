import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const doctorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  department: z.string().optional(),
  specialization: z.string().optional(),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface Props {
  onClose: () => void;
  onSave: (data: { name: string; department?: string; specialization?: string }) => Promise<void>;
  initialData?: any;
}

export function DoctorModal({ onClose, onSave, initialData }: Props) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: initialData?.name || '',
      department: initialData?.department || '',
      specialization: initialData?.specialization || '',
    },
  });

  const onSubmit = async (data: DoctorFormData) => {
    setLoading(true);
    try {
      await onSave(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">{initialData ? 'Edit Doctor' : 'Add Doctor'}</div>
        <div className="modal-sub">Enter doctor details below</div>
        
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          <div>
            <label className="form-label">Name *</label>
            <input className="form-control" placeholder="e.g. Dr. Jane Smith" {...register('name')} />
            {errors.name && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.name.message}</p>}
          </div>

          <div>
            <label className="form-label">Department</label>
            <input className="form-control" placeholder="e.g. Dermatology" {...register('department')} />
          </div>

          <div>
            <label className="form-label">Specialization</label>
            <input className="form-control" placeholder="e.g. Hair Transplant" {...register('specialization')} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-save" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
