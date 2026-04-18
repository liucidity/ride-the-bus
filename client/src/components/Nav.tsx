import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Nav() {
  return (
    <nav
      className="flex items-center justify-between px-5 py-3"
      style={{
        background: 'rgba(6, 15, 9, 0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(45, 186, 110, 0.15)',
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 group">
        <img src="schoolbus.png" alt="logo" className="h-9 w-auto" />
        <span
          className="font-display font-bold text-lg uppercase tracking-widest"
          style={{ color: 'var(--white)', letterSpacing: '0.18em' }}
        >
          Bus Riders
        </span>
      </Link>

      {/* Mode links */}
      <ul className="flex gap-1">
        {[
          { to: '/solo',  label: 'Solo'  },
          { to: '/party', label: 'Party' },
        ].map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                [
                  'px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider transition-all duration-200',
                  isActive
                    ? 'text-felt-dark'
                    : 'hover:text-white',
                ].join(' ')
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--green)' : 'transparent',
                color: isActive ? 'var(--bg)' : 'var(--white-dim)',
                border: isActive ? 'none' : '1px solid transparent',
              })}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
