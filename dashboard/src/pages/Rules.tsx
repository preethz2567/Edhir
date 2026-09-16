import React, { useState } from 'react';
import { Plus, X, Shield } from 'lucide-react';

interface Rule {
  id: string;
  pattern: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  isGlobal: boolean;
  active: boolean;
}

const initialRules: Rule[] = [
  { id: 'rule-g1', pattern: '(?i)(union|select|insert).*', type: 'SQL Injection',   severity: 'high',   isGlobal: true,  active: true },
  { id: 'rule-g2', pattern: '<script.*?>',                  type: 'XSS',             severity: 'high',   isGlobal: true,  active: true },
  { id: 'rule-g3', pattern: '\\.\\./.*',                    type: 'Path Traversal',  severity: 'medium', isGlobal: true,  active: true },
  { id: 'rule-t1', pattern: '/api/admin/.*',                type: 'Admin Access',    severity: 'medium', isGlobal: false, active: true },
];

export function Rules() {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [showForm, setShowForm] = useState(false);
  const [pattern, setPattern] = useState('');
  const [type, setType] = useState('Custom');
  const [severity, setSeverity] = useState<'high' | 'medium' | 'low'>('medium');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: Rule = {
      id: `rule-t${Date.now()}`,
      pattern,
      type,
      severity,
      isGlobal: false,
      active: true,
    };
    setRules([...rules, newRule]);
    setShowForm(false);
    setPattern('');
    setType('Custom');
    setSeverity('medium');
  };

  const handleToggle = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const handleDelete = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id || r.isGlobal));
  };

  return (
    <div className="page-wrapper">
      <div className="page-inner">
        <div className="page-header">
          <div>
            <h1 className="page-title">Rules</h1>
            <p className="page-subtitle">WAF detection patterns and custom rule management</p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={13} />
            Add rule
          </button>
        </div>

        {/* Add rule form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="card-header">
              <span className="card-title">New custom rule</span>
              <button className="btn-icon" onClick={() => setShowForm(false)}>
                <X size={14} />
              </button>
            </div>
            <form
              onSubmit={handleAdd}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 10rem 9rem auto',
                gap: '0.75rem',
                alignItems: 'flex-end',
              }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Regex pattern</label>
                <input
                  type="text"
                  className="form-input"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="^/restricted/.*$"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Attack type</label>
                <input
                  type="text"
                  className="form-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Severity</label>
                <select
                  className="form-input form-select"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as 'high' | 'medium' | 'low')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
                Save
              </button>
            </form>
            <p className="form-hint" style={{ marginTop: '0.75rem' }}>
              Custom rules are stored locally in this session. Persistent backend rule storage coming soon.
            </p>
          </div>
        )}

        {/* Rules table */}
        <div className="data-table">
          <div className="data-table-header">
            <span className="card-title">
              {rules.length} rule{rules.length !== 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-2)' }}>
              <Shield size={12} />
              Global rules are read-only
            </div>
          </div>

          <div
            className="data-row header-row"
            style={{ gridTemplateColumns: '1fr 9rem 5.5rem 5.5rem 5.5rem 4rem' }}
          >
            <div className="data-cell">Pattern</div>
            <div className="data-cell">Type</div>
            <div className="data-cell">Severity</div>
            <div className="data-cell">Scope</div>
            <div className="data-cell">Status</div>
            <div className="data-cell" style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {rules.map((rule) => (
            <div
              key={rule.id}
              className="data-row"
              style={{
                gridTemplateColumns: '1fr 9rem 5.5rem 5.5rem 5.5rem 4rem',
                opacity: rule.active ? 1 : 0.5,
              }}
            >
              <div className="data-cell mono">{rule.pattern}</div>
              <div className="data-cell" style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>
                {rule.type}
              </div>
              <div className="data-cell">
                <span className={`badge ${rule.severity}`}>{rule.severity}</span>
              </div>
              <div className="data-cell">
                <span className="badge" style={{ textTransform: 'none' }}>
                  {rule.isGlobal ? 'Global' : 'Custom'}
                </span>
              </div>
              <div className="data-cell">
                <span className={`badge ${rule.active ? 'allow' : ''}`}>
                  {rule.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="data-cell" style={{ textAlign: 'right', display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                {!rule.isGlobal && (
                  <>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleToggle(rule.id)}
                      title={rule.active ? 'Disable' : 'Enable'}
                    >
                      {rule.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDelete(rule.id)}
                      title="Delete rule"
                    >
                      <X size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
