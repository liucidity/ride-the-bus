import React from 'react';

type Props = {
  state: any;
};

const ROUND_PROMPTS: Record<number, string> = {
  1: 'Is the first card Red or Black?',
  2: 'Higher or Lower than the first card?',
  3: 'Inside or Outside the first two cards?',
  4: 'Guess the suit of the fourth card!',
};

export default function Message({ state }: Props) {
  const playerGuesses = Object.keys(state.players).map((player) => ({
    player,
    choice: state.players[player].choice,
  }));

  return (
    <div id="message-box" className="flex flex-col items-center gap-2 py-2">
      {/* Winner announcement */}
      {state.gameState === 'end' && (
        <div
          className="font-display text-2xl font-bold animate-slide-up"
          style={{ color: 'var(--gold)', textShadow: '0 0 30px rgba(232,184,75,0.5)' }}
        >
          🏆 {state.winner} wins!
        </div>
      )}

      {/* Reveal: player choices */}
      {state.status === 'reveal' && (
        <div className="flex flex-wrap justify-center gap-2 animate-slide-up">
          {playerGuesses.map(({ player, choice }) => (
            <span
              key={player}
              className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--white)',
              }}
            >
              <span style={{ color: 'var(--gold)' }}>{player}</span>
              {choice ? ` → ${choice}` : ' —'}
            </span>
          ))}
        </div>
      )}

      {/* Round prompt */}
      {state.gameState !== 'end' && state.status === 'none' && state.timer > 0 && (
        <p
          className="font-display italic text-base animate-fade-in"
          style={{ color: 'var(--white-dim)' }}
        >
          {ROUND_PROMPTS[state.round]}
        </p>
      )}
    </div>
  );
}
