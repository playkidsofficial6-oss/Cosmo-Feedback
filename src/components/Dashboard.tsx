import { useState } from 'react';
import type { Patient } from '../services/db';
import {
  getTodayStats, getDoctorAnalytics, getSourceAnalytics, getMarketingAnalytics
} from '../services/db';

interface Props {
  patients: Patient[];
  appointments?: any[];
  allDoctors?: any[];
  onAddDoctor?: () => void;
  onEditDoctor?: (doc: any) => void;
  onDeleteDoctor?: (docId: string) => void;
}

export function Dashboard({ patients, appointments = [], allDoctors = [], onAddDoctor, onEditDoctor, onDeleteDoctor }: Props) {
  const [tab, setTab] = useState<'overview' | 'sources' | 'doctors'>('overview');

  const stats   = getTodayStats(patients, appointments);
  const doctors = getDoctorAnalytics(patients, appointments);
  const sources = getSourceAnalytics(patients);
  const mktg    = getMarketingAnalytics(patients).slice(0, 7);

  const maxMktg = Math.max(...mktg.map(m => m.count), 1);

  return (
    <div className="dashboard-shell">
      {/* Header */}
      <div className="dash-header">
        <div>
          <div className="dash-title">Analytics</div>
          <div className="dash-sub">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div className="dash-actions">
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Today's Patients</div>
          <div className="kpi-value">{stats.patientsConsulted}</div>
          <div className="kpi-hint">{stats.vipPatients} VIP / Celebrity</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Reviews Collected</div>
          <div className="kpi-value">{stats.reviewsSubmitted}</div>
          <div className="kpi-hint">of {stats.reviewsRequested} requested</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Conversion Rate</div>
          <div className="kpi-value">{stats.conversionRate}%</div>
          <div className="kpi-hint">review ask → submit</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg. Star Rating</div>
          <div className="kpi-value">{stats.averageRating > 0 ? stats.averageRating : '–'}</div>
          <div className="kpi-hint">out of 5 stars</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dash-tabs">
        {(['overview', 'sources', 'doctors'] as const).map(t => (
          <button
            key={t}
            id={`dash-tab-${t}`}
            className={`dash-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab: Overview — today's status breakdown */}
      {tab === 'overview' && (
        <div className="dash-grid-2">
          {/* Marketing bar chart */}
          <div className="dash-card">
            <div className="dash-card-head">Marketing Sources (All Time)</div>
            <div className="dash-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mktg.map(m => (
                <div key={m.source} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 110, fontSize: 12, color: 'var(--ink-2)', textAlign: 'right', flexShrink: 0 }}>
                    {m.source}
                  </span>
                  <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(m.count / maxMktg) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--accent) 0%, var(--primary) 100%)',
                      borderRadius: 4,
                      transition: 'width 0.6s var(--ease)'
                    }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)', width: 28, textAlign: 'right' }}>{m.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Patient type summary */}
          <div className="dash-card">
            <div className="dash-card-head">Today's Breakdown</div>
            <div className="dash-card-body">
              <table className="clean-table">
                <tbody>
                  <tr>
                    <td>Total Patients</td>
                    <td className="table-name" style={{ textAlign: 'right' }}>{stats.patientsConsulted}</td>
                  </tr>
                  <tr>
                    <td>VIP / Celebrity</td>
                    <td className="table-name" style={{ textAlign: 'right' }}>{stats.vipPatients}</td>
                  </tr>
                  <tr>
                    <td>First Time Visitors</td>
                    <td className="table-name" style={{ textAlign: 'right' }}>{stats.newPatients}</td>
                  </tr>
                  <tr>
                    <td>Returning Patients</td>
                    <td className="table-name" style={{ textAlign: 'right' }}>{stats.returningPatients}</td>
                  </tr>
                  <tr>
                    <td>Reviews Submitted</td>
                    <td className="table-name" style={{ textAlign: 'right', color: 'var(--green)' }}>{stats.reviewsSubmitted}</td>
                  </tr>
                  <tr>
                    <td>Declined</td>
                    <td className="table-name" style={{ textAlign: 'right', color: 'var(--red)' }}>
                      {stats.reviewsRequested - stats.reviewsSubmitted}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Sources */}
      {tab === 'sources' && (
        <div className="dash-card">
          <div className="dash-card-head">Source Attribution</div>
          <div className="dash-card-body" style={{ padding: 0 }}>
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Patients</th>
                  <th>Reviews</th>
                  <th>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {sources.map(s => (
                  <tr key={s.source}>
                    <td className="table-name">{s.source}</td>
                    <td>{s.patientCount}</td>
                    <td>{s.reviewCount}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 600,
                        background: s.conversionPct >= 60 ? 'var(--green-bg)' : 'var(--surface)',
                        color: s.conversionPct >= 60 ? 'var(--green)' : 'var(--ink-3)',
                      }}>
                        {s.conversionPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Doctors */}
      {tab === 'doctors' && (
        <div className="dash-card">
          <div className="dash-card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Doctor Performance</span>
            <button className="btn-add" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={onAddDoctor}>
              + Add Doctor
            </button>
          </div>
          <div className="dash-card-body" style={{ padding: 0 }}>
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Specialization</th>
                  <th>Patients</th>
                  <th>Reviews</th>
                  <th>Avg. Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allDoctors.map(doc => {
                  const analytics = doctors.find(d => d.doctorName === doc.name) || { patients: 0, reviews: 0, averageRating: 0 };
                  return (
                    <tr key={doc._id}>
                      <td className="table-name">{doc.name}</td>
                      <td>{doc.department || '—'}</td>
                      <td>{doc.specialization || '—'}</td>
                      <td>{analytics.patients}</td>
                      <td>{analytics.reviews}</td>
                      <td>
                        {analytics.averageRating > 0 ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ color: '#F59E0B', fontSize: 13 }}>★</span>
                            {analytics.averageRating}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', marginRight: '4px' }} onClick={() => onEditDoctor && onEditDoctor(doc)}>Edit</button>
                        <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--red)' }} onClick={() => onDeleteDoctor && onDeleteDoctor(doc._id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
