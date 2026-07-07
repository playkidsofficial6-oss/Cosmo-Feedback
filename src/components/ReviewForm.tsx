import { useState } from 'react';
import type { Patient } from '../services/db';
import { getMarketingSources } from '../services/db';

interface Props {
  patient: Patient;
  onSave: (id: string, updates: Partial<Patient>) => void;
}

const QUICK_TAGS = [
  'Loved consultation',
  'Interested in package',
  'Requested follow-up',
  'Brought a friend',
  'High spend potential',
];

const PURCHASE_OPTIONS: Patient['purchaseStatus'][] = [
  'Consultation Only',
  'Treatment Booked',
  'Package Purchased',
  'Follow-up Scheduled',
];

export function ReviewForm({ patient, onSave }: Props) {
  const [status,   setStatus]   = useState<'Yes' | 'No' | 'Pending'>(patient.reviewStatus);
  const [stars,    setStars]    = useState<number>(patient.reviewStars ?? 0);
  const [source,   setSource]   = useState<string>(patient.marketingSource ?? '');
  const [purchase, setPurchase] = useState<Patient['purchaseStatus']>(patient.purchaseStatus);
  const [tags,     setTags]     = useState<string[]>(patient.vipTags ?? []);
  const [notes,    setNotes]    = useState(patient.reviewNotes ?? '');
  const [saved,    setSaved]    = useState(false);

  const [isEditing, setIsEditing] = useState(patient.reviewStatus === 'Pending');
  const sources    = getMarketingSources();


  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSave = () => {
    onSave(patient.id, {
      reviewStatus:    status,
      reviewStars:     status === 'Yes' ? stars : null,
      marketingSource: source || null,
      purchaseStatus:  purchase,
      vipTags:         tags,
      reviewNotes:     notes || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!isEditing) {
    return (
      <div className="section-card fade-in" style={{ position: 'relative' }}>
        <div className="section-head">
          <span className="section-title">Check-out Summary</span>
          <button 
            className="btn-ghost" 
            style={{ padding: '4px 12px', fontSize: '11px', position: 'absolute', right: '16px', top: '12px' }} 
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        </div>
        <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div className="field-label">Review Outcome</div>
            <div className="field-value">
              {patient.reviewStatus === 'Yes' ? `⭐ Left Review (${patient.reviewStars} Stars)` : '✕ Declined'}
            </div>
          </div>
          
          {patient.marketingSource && (
            <div>
              <div className="field-label">Source</div>
              <div className="field-value">{patient.marketingSource}</div>
            </div>
          )}
          
          {patient.vipTags && patient.vipTags.length > 0 && (
            <div>
              <div className="field-label">Quick Notes</div>
              <div className="field-value">
                <div className="chips-wrap" style={{ marginTop: '4px' }}>
                  {patient.vipTags.map(t => (
                    <span key={t} className="chip selected-gold" style={{ cursor: 'default' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="field-label">Purchase Status</div>
            <div className="field-value">
              <span className="chip selected" style={{ cursor: 'default', display: 'inline-block', marginTop: '4px' }}>
                {patient.purchaseStatus}
              </span>
            </div>
          </div>

          {patient.reviewNotes && (
            <div>
              <div className="field-label">Staff Notes</div>
              <div className="field-value" style={{ whiteSpace: 'pre-wrap', background: 'var(--surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {patient.reviewNotes}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="section-card fade-in" style={{ position: 'relative' }}>

      {/* Celebration overlay */}
      {saved && (
        <div className="celebration">
          <div style={{ fontSize: 32 }}>✓</div>
          <h3>Saved!</h3>
          <p>Check-out recorded for {patient.name}</p>
        </div>
      )}

      {/* Review Status */}
      <div className="section-head">
        <span className="section-title">Review Outcome</span>
      </div>
      <div className="section-body">
        <div className="status-trio">
          <button
            id="status-yes"
            className={`status-btn ${status === 'Yes' ? 'active-yes' : ''}`}
            onClick={() => setStatus('Yes')}
          >
            <span className="status-icon">⭐</span>
            Left Review
          </button>
          <button
            id="status-pending"
            className={`status-btn ${status === 'Pending' ? 'active-pending' : ''}`}
            onClick={() => setStatus('Pending')}
          >
            <span className="status-icon">⏳</span>
            Will do later
          </button>
          <button
            id="status-no"
            className={`status-btn ${status === 'No' ? 'active-no' : ''}`}
            onClick={() => setStatus('No')}
          >
            <span className="status-icon">✕</span>
            Declined
          </button>
        </div>

        {/* Stars — only when Yes */}
        {status === 'Yes' && (
          <div className="stars-row">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} className="star-btn" onClick={() => setStars(n)}>
                <svg className="star-svg" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <polygon
                    className={n <= stars ? 'star-filled' : 'star-empty'}
                    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  />
                </svg>
              </button>
            ))}
            <span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 4 }}>
              {stars > 0 ? `${stars} star${stars > 1 ? 's' : ''}` : 'Rate visit'}
            </span>
          </div>
        )}
      </div>

      {/* Marketing Source */}
      <div className="section-head" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="section-title">How did they hear about us?</span>
      </div>
      <div className="section-body">
        <div className="chips-wrap">
          {sources.slice(0, 10).map(s => (
            <button
              key={s}
              className={`chip ${source === s ? 'selected' : ''}`}
              onClick={() => setSource(prev => prev === s ? '' : s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Tags */}
      <div className="section-head" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="section-title">Quick Notes</span>
      </div>
      <div className="section-body">
        <div className="chips-wrap">
          {QUICK_TAGS.map(t => (
            <button
              key={t}
              className={`chip ${tags.includes(t) ? 'selected-gold' : ''}`}
              onClick={() => toggleTag(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Purchase Status */}
        <div style={{ marginTop: 14 }}>
          <div className="field-label" style={{ marginBottom: 8, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            Purchase Status
          </div>
          <div className="chips-wrap">
            {PURCHASE_OPTIONS.map(p => (
              <button
                key={p}
                className={`chip ${purchase === p ? 'selected' : ''}`}
                onClick={() => setPurchase(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Notes textarea */}
        <textarea
          className="field-input"
          style={{ marginTop: 14, height: 64 }}
          placeholder="Optional staff notes…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        <button id="btn-save-checkout" className="btn-save" style={{ width: '100%', marginTop: 14 }} onClick={handleSave}>
          Complete
        </button>
      </div>
    </div>
  );
}
