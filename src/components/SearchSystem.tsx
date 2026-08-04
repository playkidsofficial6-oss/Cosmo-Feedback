import { useState, useMemo, useEffect } from 'react';
import type { Patient } from '../services/db';

interface Props {
  patients: Patient[];
  appointments?: any[];
  onSelectPatient: (p: Patient) => void;
  onEditPatient?: (p: Patient) => void;
  onDeletePatient?: (p: Patient) => void;
  activePatientId?: string;
}

const STATUS_FILTERS = ['All', 'Pending', 'Yes', 'No'] as const;
type Filter = typeof STATUS_FILTERS[number];

export function SearchSystem({ patients, appointments = [], onSelectPatient, onEditPatient, onDeletePatient, activePatientId }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [preview, setPreview] = useState<Patient | null>(null);

  useEffect(() => {
    if (preview && !patients.some(p => p.id === preview.id)) {
      setPreview(null);
    }
  }, [patients, preview]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return patients.filter(p => {
      const matchQ = !q ||
        p.name.toLowerCase().includes(q);
      const matchF = filter === 'All' || p.reviewStatus === filter;
      return matchQ && matchF;
    });
  }, [patients, appointments, query, filter]);

  const handleSelect = (p: Patient) => {
    setPreview(p);
    onSelectPatient(p);
  };

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="directory-shell">
      {/* Left: list */}
      <div className="dir-list">
        {/* Search */}
        <div className="dir-search-bar">
          <div className="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="dir-search-input"
              className="search-input"
              placeholder="Search by name, phone, doctor…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="dir-filters">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              className={`dir-filter ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="dir-items">
          {filtered.length === 0 && (
            <div className="empty-state">
              <p>No patients match your search.</p>
            </div>
          )}
          {filtered.map(p => (
            <div
              key={p.id}
              className={`dir-item ${p.id === (preview?.id ?? activePatientId) ? 'selected' : ''}`}
              onClick={() => handleSelect(p)}
            >
              <div className="dir-avatar">
                {p.photoUrl ? <img src={p.photoUrl} alt={p.name} /> : initials(p.name)}
              </div>
              <div className="dir-info">
                <div className="dir-name">{p.name}</div>
                <div className="dir-meta">
                  {(() => {
                    const appts = appointments.filter(a => a.patient && (a.patient.id === p.id || a.patient._id === p.id || a.patient === p.id));
                    const latestAppt = appts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
                    const doctorName = latestAppt?.doctor?.name || 'Unknown Doctor';
                    const treatmentCategory = latestAppt?.treatmentCategory || 'Unknown Treatment';
                    return `${doctorName} · ${treatmentCategory}`;
                  })()}
                </div>
              </div>
              <span className={`dir-status ${p.reviewStatus.toLowerCase()}`}>
                {p.reviewStatus}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: preview */}
      <div className="dir-preview">
        {preview ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 600, overflow: 'hidden'
              }}>
                {preview.photoUrl ? <img src={preview.photoUrl} alt={preview.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(preview.name)}
              </div>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, color: 'var(--ink)' }}>{preview.name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{preview.phone}</div>
              </div>
            </div>

            <div className="patient-grid">
              {(() => {
                const appts = appointments.filter(a => a.patient && (a.patient.id === preview.id || a.patient._id === preview.id || a.patient === preview.id));
                const latestAppt = appts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
                const doctorName = latestAppt?.doctor?.name || 'Unknown Doctor';
                const treatmentCategory = latestAppt?.treatmentCategory || 'Unknown Treatment';
                const visitDate = latestAppt?.createdAt ? new Date(latestAppt.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'Unknown Date';

                return (
                  <>
                    <div className="patient-field">
                      <div className="field-label">Doctor</div>
                      <div className="field-value">{doctorName}</div>
                    </div>
                    <div className="patient-field">
                      <div className="field-label">Treatment</div>
                      <div className="field-value">{treatmentCategory}</div>
                    </div>
                    <div className="patient-field">
                      <div className="field-label">Visit Date</div>
                      <div className="field-value">{visitDate}</div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="patient-grid" style={{ marginTop: 8 }}>
              <div className="patient-field">
                <div className="field-label">Review</div>
                <div className="field-value" style={{ color: preview.reviewStatus === 'Yes' ? 'var(--green)' : preview.reviewStatus === 'No' ? 'var(--red)' : 'var(--gold-dark)' }}>
                  {preview.reviewStatus}
                </div>
              </div>
              <div className="patient-field">
                <div className="field-label">Stars</div>
                <div className="field-value">{preview.reviewStars ? `★ ${preview.reviewStars}` : '—'}</div>
              </div>
              <div className="patient-field">
                <div className="field-label">Source</div>
                <div className="field-value">{preview.marketingSource ?? '—'}</div>
              </div>
            </div>

            {preview.reviewNotes && (
              <div className="patient-card" style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{preview.reviewNotes}"
              </div>
            )}

            <div className="preview-actions" style={{ marginTop: 8 }}>
              {onEditPatient && (
                <button
                  id="btn-edit-patient"
                  className="btn-action-edit"
                  onClick={() => onEditPatient(preview)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
              )}
              {onDeletePatient && (
                <button
                  id="btn-delete-patient"
                  className="btn-action-delete"
                  onClick={() => onDeletePatient(preview)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="no-selection">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <p>Select a patient from the list to preview their profile</p>
          </div>
        )}
      </div>
    </div>
  );
}
