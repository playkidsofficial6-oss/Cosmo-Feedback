import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '../services/api';

type DateFilter = 'All' | 'Today' | '7 days' | '30 days' | 'Custom';

export function AppointmentsView() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('Today');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [q, setQ] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [treatmentFilter, setTreatmentFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: doctors = [] } = useSWR<any[]>('/doctors', fetcher);

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let start = '';
    let end = '';
    
    if (dateFilter === 'Today') {
      start = today.toISOString();
      end = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
    } else if (dateFilter === '7 days') {
      start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      end = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
    } else if (dateFilter === '30 days') {
      start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      end = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
    } else if (dateFilter === 'Custom' && customDate) {
      const custom = new Date(customDate);
      start = new Date(custom.getFullYear(), custom.getMonth(), custom.getDate()).toISOString();
      end = new Date(custom.getFullYear(), custom.getMonth(), custom.getDate(), 23, 59, 59, 999).toISOString();
    }
    
    return { startDate: start, endDate: end };
  }, [dateFilter, customDate]);

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (q) queryParams.append('q', q);
  if (doctorFilter) queryParams.append('doctor', doctorFilter);
  if (treatmentFilter) queryParams.append('treatment', treatmentFilter);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  const { data, isLoading } = useSWR(`/appointments/search?${queryParams.toString()}`, fetcher);
  
  const appointments = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  return (
    <div style={{ padding: '28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: 'var(--ink)' }}>Appointments</h2>
        
        <div className="chips-wrap" style={{ margin: 0 }}>
          {['All', 'Today', '7 days', '30 days', 'Custom'].map(f => (
            <button
              key={f}
              className={`chip ${dateFilter === f ? 'selected-gold' : ''}`}
              onClick={() => { setDateFilter(f as DateFilter); setPage(1); }}
            >
              {f === '7 days' ? 'Last 7 Days' : f === '30 days' ? 'Last 30 Days' : f}
            </button>
          ))}
          
          {dateFilter === 'Custom' && (
            <input 
              type="date" 
              value={customDate}
              onChange={(e) => { setCustomDate(e.target.value); setPage(1); }}
              className="field-input"
              style={{ width: 140, padding: '4px 10px', height: '30px', fontSize: 12, marginLeft: 4 }}
            />
          )}
        </div>
      </div>

      <div className="section-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="field-label" style={{ marginBottom: 4 }}>Search</div>
          <div className="search-input-wrap" style={{ background: 'var(--surface)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              style={{ background: 'transparent' }}
              placeholder="Patient name..."
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div style={{ width: 200 }}>
          <div className="field-label" style={{ marginBottom: 4 }}>Doctor</div>
          <select 
            className="field-input" 
            value={doctorFilter} 
            onChange={e => { setDoctorFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Doctors</option>
            {doctors.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div style={{ width: 200 }}>
          <div className="field-label" style={{ marginBottom: 4 }}>Treatment</div>
          <input 
            className="field-input" 
            placeholder="e.g. Laser"
            value={treatmentFilter} 
            onChange={e => { setTreatmentFilter(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="section-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="table-responsive-wrapper" style={{ flex: 1 }}>
          <table className="clean-table" style={{ width: '100%', minWidth: '600px' }}>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Treatment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-3)' }}>Loading appointments...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-3)' }}>No appointments found.</td>
                </tr>
              ) : (
                appointments.map((appt: any) => {
                  const p = appt.patient;
                  const d = new Date(appt.createdAt);
                  return (
                    <tr key={appt._id || appt.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{p?.name || 'Unknown'}</td>
                      <td>{appt.doctor?.name || 'Unassigned'}</td>
                      <td>{appt.treatmentCategory || '-'}</td>
                      <td>
                        <span className={`patient-badge ${appt.status === 'Completed' ? 'badge-new' : 'badge-regular'}`}>
                          {appt.status || 'Scheduled'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            Showing {appointments.length} of {total} appointments
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              className="btn-ghost"
              style={{ padding: '6px 12px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', cursor: page > 1 ? 'pointer' : 'not-allowed', opacity: page > 1 ? 1 : 0.5 }}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </button>
            <div style={{ padding: '6px 12px', fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>
              Page {page} of {totalPages}
            </div>
            <button 
              className="btn-ghost"
              style={{ padding: '6px 12px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', cursor: page < totalPages ? 'pointer' : 'not-allowed', opacity: page < totalPages ? 1 : 0.5 }}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
