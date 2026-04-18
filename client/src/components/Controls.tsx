import React from 'react';
import Button from './Button';

type Props = {
  state: any;
  handleOptions: any;
  handleGuess: any;
};

const ROUND_LABELS: Record<number, string> = {
  1: 'Red or Black?',
  2: 'Higher or Lower?',
  3: 'Inside or Outside?',
  4: 'Pick the Suit',
};

export default function Controls({ state, handleOptions, handleGuess }: Props) {
  const [opt1, opt2, opt3, opt4] = handleOptions();

  if (!state.card[0]) return null;

  return (
    <div className="flex flex-col items-center gap-4 pb-10">
      {/* Round prompt */}
      <p
        className="font-display italic text-lg"
        style={{ color: 'var(--white-dim)' }}
      >
        {ROUND_LABELS[state.round]}
      </p>

      {/* Button row */}
      <div className="flex flex-row flex-wrap justify-center">
        <Button option={opt1} handleGuess={handleGuess} status={state.status} />
        <Button option={opt2} handleGuess={handleGuess} status={state.status} />
        {state.round === 4 && (
          <Button option={opt3} handleGuess={handleGuess} status={state.status} />
        )}
        {state.round === 4 && (
          <Button option={opt4} handleGuess={handleGuess} status={state.status} />
        )}
      </div>
    </div>
  );
}
