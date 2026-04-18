import React from 'react';
import PartyButton from './PartyButton';

type Props = {
  player: string;
  sendPress: any;
  round: any;
};

const ROUND_LABELS: Record<number, string> = {
  1: 'Red or Black?',
  2: 'Higher or Lower?',
  3: 'Inside or Outside?',
  4: 'Pick the Suit',
};

const ROUND_SUBLABELS: Record<number, string> = {
  1: 'What colour is the first card?',
  2: 'Is the next card higher or lower?',
  3: 'Is the third card inside or outside the first two?',
  4: 'Guess the suit — worth 3 points!',
};

function getOptions(round: number): string[] {
  switch (round) {
    case 1:  return ['Red', 'Black'];
    case 2:  return ['Higher', 'Lower'];
    case 3:  return ['Inside', 'Outside'];
    case 4:  return ['Diamond', 'Club', 'Heart', 'Spade'];
    default: return ['—', '—'];
  }
}

export default function PartyControls({ player, round, sendPress }: Props) {
  const options = getOptions(round);

  return (
    <div
      className="flex flex-col items-center justify-between px-4 py-6"
      style={{ minHeight: '100dvh' }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, transparent, var(--gold) 50%, transparent)' }}
      />

      {/* Player badge */}
      <div
        className="rounded-full px-5 py-2 text-sm font-semibold tracking-wide mt-2"
        style={{
          background: 'rgba(45, 186, 110, 0.12)',
          border: '1px solid rgba(45, 186, 110, 0.30)',
          color: 'var(--green)',
        }}
      >
        {player}
      </div>

      {/* Round info */}
      <div className="text-center animate-fade-in flex-1 flex flex-col items-center justify-center gap-2 py-6">
        <div
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}
        >
          Round {round}
        </div>
        <h2
          className="font-display font-bold"
          style={{
            fontSize: 'clamp(1.5rem, 6vw, 2rem)',
            color: 'var(--white)',
            lineHeight: 1.2,
          }}
        >
          {ROUND_LABELS[round] ?? '…'}
        </h2>
        <p
          className="text-sm max-w-xs"
          style={{ color: 'var(--white-dim)' }}
        >
          {ROUND_SUBLABELS[round] ?? ''}
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm flex flex-row flex-wrap justify-center pb-4">
        {options.map((opt) => (
          <PartyButton key={opt} option={opt} sendPress={sendPress} player={player} />
        ))}
      </div>
    </div>
  );
}
