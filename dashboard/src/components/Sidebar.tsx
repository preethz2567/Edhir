import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Target, Shield,
  AlertTriangle, Settings, LogOut, Menu, X, Hexagon,
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  tenantId: string;
}

const links = [
  { to: '/app/overview',  icon: LayoutDashboard, label: 'Overview' },
  { to: '/app/traffic',   icon: Activity,         label: 'Live Traffic' },
  { to: '/app/campaigns', icon: Target,            label: 'Campaigns' },
  { to: '/app/rules',     icon: Shield,            label: 'Rules' },
  { to: '/app/honeypot',  icon: AlertTriangle,     label: 'Honeypot' },
  { to: '/app/settings',  icon: Settings,          label: 'Settings' },
];

export function Sidebar({ onLogout, tenantId }: SidebarProps) {
  const [open, setOpen] = useState(false);

  const navContent = (
    <>
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Hexagon size={24} style={{ color: 'var(--accent)' }} />
          <div className="sidebar-wordmark">Edhir</div>
        </div>
        <div className="sidebar-tenant">
          {tenantId.substring(0, 12)}…
        </div>
      </div>

      <nav className="sidebar-nav" onClick={() => setOpen(false)}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <link.icon size={15} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={onLogout}
          className="sidebar-link btn-ghost"
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar md:hidden">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Hexagon size={20} style={{ color: 'var(--accent)' }} />
          <span className="mobile-topbar-title">Edhir</span>
        </div>
        <button
          className="btn-icon"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Overlay (mobile) */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${open ? 'open' : ''}`}>
        {/* Mobile close button */}
        <button
          className="btn-icon"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          style={{
            display: 'none',
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
          }}
        >
          <X size={16} />
        </button>
        {navContent}
      </div>
    </>
  );
}
