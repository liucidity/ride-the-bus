import React from 'react';
import { Link } from 'react-router-dom';

const FLOATERS: { suit: string; left: string; dur: string; delay: string; size: string; isRed: boolean }[] = [
  { suit: '♠', left: '4%',  dur: '13s', delay: '0s',   size: '72px',  isRed: false },
  { suit: '♥', left: '18%', dur: '9s',  delay: '3.5s', size: '56px',  isRed: true  },
  { suit: '♦', left: '36%', dur: '15s', delay: '1s',   size: '88px',  isRed: true  },
  { suit: '♣', left: '54%', dur: '11s', delay: '5s',   size: '64px',  isRed: false },
  { suit: '♠', left: '70%', dur: '10s', delay: '2s',   size: '50px',  isRed: false },
  { suit: '♥', left: '84%', dur: '14s', delay: '7s',   size: '80px',  isRed: true  },
  { suit: '♦', left: '92%', dur: '8s',  delay: '4s',   size: '44px',  isRed: true  },
];

const ROUNDS = [
  { n: '1', label: 'Red or Black?',      icon: '🔴' },
  { n: '2', label: 'Higher or Lower?',   icon: '📈' },
  { n: '3', label: 'Inside or Outside?', icon: '↕️'  },
  { n: '4', label: 'Pick the Suit',      icon: '♠️'  },
];

export default function Home() {
  return (
    <div
      className="relative min-h-screen felt-bg flex flex-col items-center justify-center overflow-hidden px-6 py-16"
    >
      {/* Top gold accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, transparent, var(--gold) 50%, transparent)' }}
      />

      {/* Floating suit symbols */}
      {FLOATERS.map((f, i) => (
        <span
          key={i}
          className="absolute bottom-[-8%] pointer-events-none select-none"
          style={{
            left: f.left,
            fontSize: f.size,
            color: f.isRed ? 'rgba(224, 64, 58, 0.10)' : 'rgba(248, 240, 227, 0.06)',
            animation: `float-up ${f.dur} linear ${f.delay} infinite`,
          }}
        >
          {f.suit}
        </span>
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>

        {/* Suit row */}
        <p
          className="text-xl tracking-[0.5em] mb-4"
          style={{ color: 'var(--gold)', letterSpacing: '0.45em' }}
        >
          ♠ ♥ ♦ ♣
        </p>

        {/* Title */}
        <h1
          className="font-display font-black leading-none mb-2"
          style={{
            fontSize: 'clamp(2.8rem, 9vw, 6.5rem)',
            color: 'var(--white)',
            textShadow: '0 2px 40px rgba(45, 186, 110, 0.25)',
            letterSpacing: '0.04em',
          }}
        >
          Ride the Bus
        </h1>

        {/* Gold divider */}
        <div className="flex items-center gap-3 my-5 justify-center">
          <div
            className="h-px flex-1 max-w-[180px]"
            style={{ background: 'linear-gradient(90deg, transparent, var(--gold))' }}
          />
          <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>✦</span>
          <div
            className="h-px flex-1 max-w-[180px]"
            style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }}
          />
        </div>

        {/* Tagline */}
        <p
          className="text-sm md:text-base mb-10 uppercase tracking-widest"
          style={{ color: 'var(--white-dim)', letterSpacing: '0.22em' }}
        >
          Can you make it to the end?
        </p>

        {/* Mode cards */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <ModeCard
            to="/solo"
            icon="🃏"
            title="Solo Play"
            desc="Challenge yourself"
            accentColor="var(--green)"
            bgFrom="#152e1f"
            bgTo="#0e2518"
            borderColor="rgba(45, 186, 110,"
          />
          <ModeCard
            to="/party"
            icon="🎉"
            title="Party Mode"
            desc="Play with friends"
            accentColor="var(--gold)"
            bgFrom="#2a1f06"
            bgTo="#1a1308"
            borderColor="rgba(232, 184, 75,"
          />
        </div>

        {/* How-to row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl mx-auto">
          {ROUNDS.map(({ n, label, icon }) => (
            <div
              key={n}
              className="rounded-xl p-3 text-center"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="text-xl mb-1">{icon}</div>
              <div
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--gold)' }}
              >
                Round {n}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--white-dim)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gold accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, transparent, var(--gold) 50%, transparent)' }}
      />
    </div>
  );
}

/* ── Mode card ── */
type ModeCardProps = {
  to: string;
  icon: string;
  title: string;
  desc: string;
  accentColor: string;
  bgFrom: string;
  bgTo: string;
  borderColor: string;
};

function ModeCard({ to, icon, title, desc, accentColor, bgFrom, bgTo, borderColor }: ModeCardProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <Link
      to={to}
      className="block rounded-2xl px-10 py-7 text-center transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`,
        border: `1px solid ${borderColor}${hovered ? '0.65)' : '0.25)'}`,
        minWidth: '210px',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? `0 18px 44px ${borderColor}0.18)` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="text-4xl mb-2">{icon}</div>
      <div
        className="font-display text-xl font-bold mb-1"
        style={{ color: accentColor }}
      >
        {title}
      </div>
      <div className="text-xs tracking-wide" style={{ color: 'var(--white-dim)' }}>
        {desc}
      </div>
    </Link>
  );
}
