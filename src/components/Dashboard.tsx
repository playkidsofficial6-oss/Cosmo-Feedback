import React, { useState } from 'react';
import type { Patient } from '../services/db';
import {
  getTodayStats, getDoctorAnalytics, getSourceAnalytics, getMarketingAnalytics
} from '../services/db';

interface Props {
  onResetDb: () => void;
  patients: Patient[];
}

export function Dashboard({ onResetDb, patients }: Props) {
  const [tab, setTab] = useState<'overview' | 'sources' | 'doctors'>('overview');

  const stats   = getTodayStats(patients);
  const doctors = getDoctorAnalytics(patients);
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
          <button id="btn-reset-db" className="btn-outline danger" onClick={onResetDb}>
            ↺ Reset Demo Data
          </button>
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
                      background: 'var(--gold)',
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
          <div className="dash-card-head">Doctor Performance</div>
          <div className="dash-card-body" style={{ padding: 0 }}>
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Patients</th>
                  <th>Reviews</th>
                  <th>Avg. Rating</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d.doctorName}>
                    <td className="table-name">{d.doctorName}</td>
                    <td>{d.patients}</td>
                    <td>{d.reviews}</td>
                    <td>
                      {d.averageRating > 0 ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: 'var(--gold)', fontSize: 13 }}>★</span>
                          {d.averageRating}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
