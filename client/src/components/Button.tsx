import React, { useState } from 'react';

type Props = {
  option: string;
  handleGuess: any;
  status: string;
};

const SUIT_COLORS: Record<string, string> = {
  Heart:   '#e0403a',
  Diamond: '#e0403a',
  Red:     '#e0403a',
  Club:    'var(--white)',
  Spade:   'var(--white)',
  Black:   'var(--white)',
};

export default function Button({ option, handleGuess, status }: Props) {
  const [pressed, setPressed] = useState(false);
  const disabled = status === 'correct' || status === 'incorrect';
  const accentColor = SUIT_COLORS[option];

  const handleClick = () => {
    if (disabled) return;
    setPressed(true);
    handleGuess(option);
    setTimeout(() => setPressed(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="relative font-semibold uppercase tracking-widest text-sm transition-all duration-200 rounded-full"
      style={{
        minWidth: '130px',
        padding: '12px 24px',
        margin: '8px',
        background: pressed
          ? 'var(--green)'
          : disabled
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(45, 186, 110, 0.10)',
        color: disabled
          ? 'rgba(248,240,227,0.25)'
          : accentColor ?? 'var(--green)',
        border: `1px solid ${
          disabled
            ? 'rgba(255,255,255,0.07)'
            : pressed
            ? 'var(--green)'
            : 'rgba(45, 186, 110, 0.40)'
        }`,
        transform: pressed ? 'scale(0.96) translateY(2px)' : 'scale(1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '0.12em',
      }}
    >
      {option}
    </button>
  );
}
