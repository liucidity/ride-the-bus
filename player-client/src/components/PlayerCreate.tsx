import React, { useState } from 'react';

type Props = {
  setUser: any;
  setUsername: any;
  username: string;
};

export default function PlayerCreate({ setUser, setUsername, username }: Props) {
  const [focused, setFocused] = useState(false);
  const valid = username.length > 0;

  const handleClick = () => {
    if (valid) setUser(username);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && valid) setUser(username);
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-8"
      style={{ minHeight: '100dvh' }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, transparent, var(--gold) 50%, transparent)' }}
      />

      <div className="w-full max-w-sm flex flex-col items-center gap-8 animate-scale-in">

        {/* Header */}
        <div className="text-center">
          <p
            className="text-2xl tracking-[0.5em] mb-3"
            style={{ color: 'var(--gold)', letterSpacing: '0.45em' }}
          >
            ♠ ♥ ♦ ♣
          </p>
          <h1
            className="font-display font-black leading-tight mb-2"
            style={{
              fontSize: 'clamp(2rem, 8vw, 2.8rem)',
              color: 'var(--white)',
              textShadow: '0 2px 30px rgba(45, 186, 110, 0.2)',
            }}
          >
            Ride the Bus
          </h1>
          <p
            className="text-sm uppercase tracking-widest"
            style={{ color: 'var(--white-dim)', letterSpacing: '0.2em' }}
          >
            Enter your name to join
          </p>
        </div>

        {/* Gold divider */}
        <div className="flex items-center gap-3 w-full">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,184,75,0.35))' }} />
          <span style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>✦</span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(232,184,75,0.35), transparent)' }} />
        </div>

        {/* Input */}
        <div className="w-full flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Your name…"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoFocus
              autoComplete="off"
              className="w-full rounded-2xl px-5 py-4 text-base font-medium outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${focused ? 'var(--green)' : 'rgba(255,255,255,0.12)'}`,
                color: 'var(--white)',
                caretColor: 'var(--green)',
                boxShadow: focused ? '0 0 0 3px rgba(45, 186, 110, 0.12)' : 'none',
              }}
            />
          </div>

          <button
            onClick={handleClick}
            disabled={!valid}
            className="w-full rounded-2xl py-4 font-bold uppercase tracking-widest text-sm transition-all duration-200"
            style={{
              background: valid
                ? 'linear-gradient(135deg, var(--green) 0%, #1e8a4e 100%)'
                : 'rgba(255,255,255,0.06)',
              color: valid ? 'var(--bg)' : 'var(--white-dim)',
              border: valid ? 'none' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: valid ? '0 8px 28px rgba(45, 186, 110, 0.30)' : 'none',
              cursor: valid ? 'pointer' : 'not-allowed',
              letterSpacing: '0.14em',
              transform: valid ? 'scale(1)' : 'scale(0.99)',
            }}
          >
            I'm Ready!
          </button>
        </div>

        <p
          className="text-xs text-center"
          style={{ color: 'var(--white-dim)', opacity: 0.5 }}
        >
          Wait for the host to start the game
        </p>
      </div>
    </div>
  );
}
