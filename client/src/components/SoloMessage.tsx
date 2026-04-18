import React from 'react';

type Props = {
  status: any;
};

export default function SoloMessage({ status }: Props) {
  if (status === 'correct') {
    return (
      <div
        className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm uppercase tracking-widest animate-slide-up"
        style={{
          background: 'rgba(45, 186, 110, 0.15)',
          border: '1px solid rgba(45, 186, 110, 0.45)',
          color: 'var(--green)',
          letterSpacing: '0.12em',
        }}
      >
        <span>✓</span> Nice! Move to the next round.
      </div>
    );
  }

  if (status === 'incorrect') {
    return (
      <div
        className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm uppercase tracking-widest animate-slide-up"
        style={{
          background: 'rgba(224, 64, 58, 0.12)',
          border: '1px solid rgba(224, 64, 58, 0.40)',
          color: 'var(--red)',
          letterSpacing: '0.12em',
        }}
      >
        <span>✗</span> Wrong! Take a sip and restart.
      </div>
    );
  }

  return null;
}
