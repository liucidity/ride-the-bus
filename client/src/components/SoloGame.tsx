import React from 'react';
import SoloMessage from './SoloMessage';
import Card from './Card';
import ReactCardFlip from 'react-card-flip';

type Props = {
  state: any;
  updateDeck: any;
};

const ROUND_STEPS = ['Color', 'Value', 'Range', 'Suit'];

export default function SoloGame({ state, updateDeck }: Props) {
  const hasCards = !!state.card[0];

  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-2">
      {/* Round progress */}
      {hasCards && (
        <div className="flex items-center gap-2 mb-8 animate-fade-in">
          {ROUND_STEPS.map((label, i) => {
            const step = i + 1;
            const done = step < state.round;
            const active = step === state.round;
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                    style={{
                      background: active
                        ? 'var(--green)'
                        : done
                        ? 'rgba(45, 186, 110, 0.35)'
                        : 'rgba(255,255,255,0.07)',
                      color: active
                        ? 'var(--bg)'
                        : done
                        ? 'var(--green)'
                        : 'var(--white-dim)',
                      border: active ? 'none' : done ? '1px solid var(--green)' : '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {done ? '✓' : step}
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-wider hidden sm:block"
                    style={{ color: active ? 'var(--white)' : 'var(--white-dim)' }}
                  >
                    {label}
                  </span>
                </div>
                {i < ROUND_STEPS.length - 1 && (
                  <div
                    className="h-px w-8 mb-4"
                    style={{
                      background: done
                        ? 'rgba(45, 186, 110, 0.5)'
                        : 'rgba(255,255,255,0.12)',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Start prompt */}
      {!hasCards && (
        <div className="flex flex-col items-center gap-6 mt-16 animate-scale-in">
          <p
            className="font-display italic text-xl"
            style={{ color: 'var(--white-dim)' }}
          >
            Ready to ride?
          </p>
          <button
            className="rounded-full font-semibold uppercase tracking-widest text-sm transition-all duration-200 hover:scale-105"
            style={{
              padding: '14px 40px',
              background: 'linear-gradient(135deg, var(--green) 0%, #1e8a4e 100%)',
              color: 'var(--bg)',
              boxShadow: '0 8px 28px rgba(45, 186, 110, 0.35)',
              letterSpacing: '0.14em',
            }}
            onClick={() => updateDeck('draw', 4)}
          >
            Start Game
          </button>
        </div>
      )}

      {/* Card row */}
      {hasCards && (
        <div className="flex flex-row flex-wrap justify-center gap-2 sm:gap-3 mb-6">
          {state.card.map((card: any, index: number) => (
            <div key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.08}s` }}>
              <ReactCardFlip isFlipped={state.faces[index]} flipDirection="horizontal">
                <Card value="card-back" image="blue-card-back.png" />
                <Card value={card.code} image={card.image} />
              </ReactCardFlip>
            </div>
          ))}
        </div>
      )}

      {/* Remaining cards badge */}
      {hasCards && (
        <div
          className="rounded-full px-4 py-1 text-xs font-medium tracking-wide mb-5"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'var(--white-dim)',
          }}
        >
          {state.deck.remaining} cards remaining
        </div>
      )}

      {/* Status message */}
      <div className="h-14 flex items-center justify-center">
        {state.status === 'correct' && <SoloMessage status="correct" />}
        {state.status === 'incorrect' && <SoloMessage status="incorrect" />}
      </div>
    </div>
  );
}
