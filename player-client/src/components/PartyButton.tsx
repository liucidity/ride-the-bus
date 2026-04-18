import React, { useState } from 'react';

type Props = {
  option: any;
  sendPress: any;
  player: string;
};

const SUIT_ICONS: Record<string, string> = {
  Heart:   '♥',
  Diamond: '♦',
  Club:    '♣',
  Spade:   '♠',
  Red:     '🔴',
  Black:   '⚫',
  Higher:  '↑',
  Lower:   '↓',
  Inside:  '↔',
  Outside: '↕',
};

const SUIT_ACCENT: Record<string, string> = {
  Heart:   '#e0403a',
  Diamond: '#e0403a',
  Red:     '#e0403a',
  Club:    'var(--white)',
  Spade:   'var(--white)',
  Black:   'var(--white)',
};

export default function PartyButton({ option, player, sendPress }: Props) {
  const [pressed, setPressed] = useState(false);
  const [sent, setSent] = useState(false);

  const accent = SUIT_ACCENT[option] ?? 'var(--green)';
  const icon = SUIT_ICONS[option] ?? '';

  const handlePress = () => {
    if (sent) return;
    setPressed(true);
    setSent(true);
    sendPress(player, option);
    setTimeout(() => setPressed(false), 250);
    // Allow re-press after 2s (in case round changes)
    setTimeout(() => setSent(false), 2500);
  };

  return (
    <button
      onClick={handlePress}
      className="relative rounded-2xl font-bold uppercase tracking-widest transition-all duration-200 select-none"
      style={{
        width: 'calc(50% - 12px)',
        maxWidth: '180px',
        minHeight: '80px',
        margin: '6px',
        background: sent
          ? 'rgba(45, 186, 110, 0.18)'
          : 'rgba(255, 255, 255, 0.04)',
        border: `1.5px solid ${
          sent
            ? 'rgba(45, 186, 110, 0.55)'
            : 'rgba(255, 255, 255, 0.12)'
        }`,
        color: sent ? 'var(--green)' : accent,
        transform: pressed ? 'scale(0.94)' : 'scale(1)',
        boxShadow: sent ? '0 4px 20px rgba(45, 186, 110, 0.20)' : 'none',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        letterSpacing: '0.1em',
        fontSize: '0.85rem',
      }}
    >
      <span
        className="block text-2xl mb-1"
        style={{ opacity: sent ? 0.6 : 1 }}
      >
        {sent ? '✓' : icon}
      </span>
      {option}
    </button>
  );
}
