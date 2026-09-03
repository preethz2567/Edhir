import React, { useState } from 'react';
import { Shield, Plus } from 'lucide-react';

interface RuleMock {
  id: string;
  pattern: string;
  type: string;
  severity: string;
  isGlobal: boolean;
  active: boolean;
}

const initialRules: RuleMock[] = [
  { id: 'rule-g1', pattern: '(?i)(union|select|insert).*', type: 'SQLi', severity: 'high', isGlobal: true, active: true },
  { id: 'rule-g2', pattern: '<script.*?>', type: 'XSS', severity: 'high', isGlobal: true, active: true },
  { id: 'rule-t1', pattern: '/api/admin/.*', type: 'Path Traversal', severity: 'medium', isGlobal: false, active: true },
];

export function Rules() {
  const [rules, setRules] = useState<RuleMock[]>(initialRules);
  const [showForm, setShowForm] = useState(false);
  
  const [pattern, setPattern] = useState('');
  const [type, setType] = useState('Custom');
  const [severity, setSeverity] = useState('medium');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: RuleMock = {
      id: `rule-t${Date.now()}`,
      pattern,
      type,
      severity,
      isGlobal: false,
      active: true
    };
    setRules([...rules, newRule]);
    setShowForm(false);
    setPattern('');
  };

  return (
    <div className="content-wrapper">
      <div className="content-inner">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Rules</h1>
            <p className="dashboard-subtitle">Manage WAF patterns and detection rules</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Add Rule
          </button>
        </div>

        {showForm && (
          <div className="solid-card" style={{ marginBottom: '2rem' }}>
            <h3 className="section-header" style={{ marginBottom: '1.5rem' }}>Add Custom Rule</h3>
            <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Regex Pattern</label>
                <input type="text" className="form-input" value={pattern} onChange={e => setPattern(e.target.value)} required placeholder="^/restricted/.*$" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Attack Type</label>
                <input type="text" className="form-input" value={type} onChange={e => setType(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Severity</label>
                <select className="form-input" value={severity} onChange={e => setSeverity(e.target.value)} style={{ appearance: 'auto' }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Save</button>
            </form>
          </div>
        )}

        <div className="solid-card">
          <div className="list-container">
            {rules.map(rule => (
              <div key={rule.id} className="list-item">
                <div className="item-main">
                  <div className="item-id">
                    <Shield size={16} color={rule.isGlobal ? 'var(--text-secondary)' : 'var(--accent-teal)'} />
                    {rule.isGlobal ? 'Global' : 'Custom'} Rule: {rule.type}
                  </div>
                  <div className="item-meta" style={{ fontFamily: 'monospace' }}>
                    {rule.pattern}
                  </div>
                </div>
                <div className="item-end">
                  <span className={`badge`} style={{ textTransform: 'uppercase' }}>{rule.severity}</span>
                  <span className={`delta-pill ${rule.active ? 'positive' : ''}`}>{rule.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
