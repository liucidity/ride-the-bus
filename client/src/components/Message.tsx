import React from 'react';

type Props = {
  state: any;
};

const ROUND_PROMPTS: Record<number, string> = {
  1: 'Is the first card Red or Black?',
  2: 'Higher or Lower than the first card?',
  3: '→← inside or ←→ outside the first two cards?',
  4: 'Guess the suit — correct earns a golden shield card!',
};

export default function Message({ state }: Props) {
  const playerGuesses = Object.keys(state.players).map((player) => ({
    player,
    choice: state.players[player].choice,
    sips: state.players[player].sips || 0,
    handLength: (state.players[player].hand || []).length,
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

      {/* Reveal: player choices with hand + sips */}
      {state.status === 'reveal' && (
        <div className="flex flex-wrap justify-center gap-2 animate-slide-up">
          {playerGuesses.map(({ player, choice, sips, handLength }) => (
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
              <span style={{ color: 'var(--green)', marginLeft: 4 }}>{handLength} 🃏</span>
              {sips > 0 && (
                <span style={{ color: 'rgba(224, 64, 58, 0.85)', marginLeft: 4 }}>
                  {sips} 💧
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Round prompt + waiting status */}
      {state.gameState !== 'end' && state.status === 'none' && state.timer >= -1 && (
        <>
          <p
            className="font-display italic text-base animate-fade-in"
            style={{ color: 'var(--white-dim)' }}
          >
            {ROUND_PROMPTS[state.round]}
          </p>
          {state.round === 4 && state.lap < state.maxLaps && (
            <p className="text-xs animate-fade-in" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Lap {state.lap + 1} coming up after this round
            </p>
          )}
          {state.timer === -1 && (
            <div className="flex flex-wrap justify-center gap-2 mt-1 animate-fade-in">
              {playerGuesses.map(({ player, choice }) => (
                <span
                  key={player}
                  className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
                  style={{
                    background: choice ? 'rgba(45, 186, 110, 0.10)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${choice ? 'rgba(45, 186, 110, 0.35)' : 'rgba(255,255,255,0.10)'}`,
                    color: choice ? 'var(--green)' : 'rgba(248,240,227,0.35)',
                  }}
                >
                  {player} {choice ? '✓' : '…'}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
