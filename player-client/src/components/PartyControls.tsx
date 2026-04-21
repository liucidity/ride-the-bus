import React, { useState, useEffect } from 'react';
import PartyButton from './PartyButton';

type HandCard = { value: number; suit: string; code: string; golden?: boolean };

type ResEvent =
  | { type: 'assign'; from: string; to: string; amount: number }
  | { type: 'redirect'; from: string; to: string; amount: number }
  | { type: 'protect'; player: string; target: string }
  | { type: 'blocked'; from: string; to: string; amount: number };

type Props = {
  player: string;
  sendPress: any;
  round: any;
  lap: number;
  maxLaps: number;
  gameState: string;
  hand: HandCard[];
  mySips: number;
  myHandLength: number;
  leaderboard: Record<string, { sips: number; handLength: number }>;
  declarationPhase: boolean;
  declarationPyramidCard: HandCard | null;
  declarationSips: number;
  declarationAllPlayers: string[];
  declared: boolean;
  resolutionPhase: boolean;
  resolutionEvents: ResEvent[];
  onDeclare: (cardCode: string, cardGolden: boolean, target: string) => void;
  onPass: () => void;
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
  3: 'Is the third card inside (→←) or outside (←→) the first two?',
  4: 'Guess the suit — earn a golden shield card!',
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

function suitSymbol(suit: string): string {
  switch (suit) {
    case 'HEARTS':   return '♥';
    case 'DIAMONDS': return '♦';
    case 'CLUBS':    return '♣';
    case 'SPADES':   return '♠';
    default:         return '?';
  }
}

function suitColor(suit: string): string {
  return suit === 'HEARTS' || suit === 'DIAMONDS' ? '#c0392b' : '#1a1a2e';
}

function valueDisplay(value: number): string {
  if (value === 14) return 'A';
  if (value === 13) return 'K';
  if (value === 12) return 'Q';
  if (value === 11) return 'J';
  return String(value);
}

function getCardEffect(
  handCard: HandCard,
  pyramidCard: HandCard
): 'protect' | 'assign' | 'redirect' | 'none' {
  if (handCard.golden) return 'protect';
  if (handCard.value === pyramidCard.value) return 'assign';
  if (handCard.suit === pyramidCard.suit) return 'redirect';
  return 'none';
}

function MiniCard({
  card,
  selected,
  onClick,
}: {
  card: HandCard;
  selected?: boolean;
  onClick?: () => void;
}) {
  const textColor = suitColor(card.suit);
  const isGolden = card.golden === true;

  return (
    <div
      onClick={onClick}
      style={{
        width: 40,
        height: 54,
        borderRadius: 6,
        background: isGolden
          ? 'linear-gradient(145deg, #fffbe6 0%, #f8f0e3 100%)'
          : '#f8f0e3',
        border: selected
          ? '2px solid var(--green, #2dba6e)'
          : isGolden
          ? '2px solid #e8b84b'
          : '1px solid rgba(255,255,255,0.25)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: textColor,
        fontWeight: 800,
        userSelect: 'none',
        boxShadow: isGolden
          ? '0 0 10px 3px rgba(232,184,75,0.45), 0 2px 6px rgba(0,0,0,0.35)'
          : selected
          ? '0 0 10px 3px rgba(45,186,110,0.35)'
          : '0 2px 6px rgba(0,0,0,0.35)',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        transform: selected ? 'scale(1.08) translateY(-3px)' : 'none',
        transition: 'transform 0.15s, box-shadow 0.15s, border 0.15s',
        animation: isGolden ? 'golden-shimmer 2s ease-in-out infinite' : 'none',
        position: 'relative',
      }}
    >
      <div style={{ fontSize: '0.9rem', lineHeight: 1 }}>{valueDisplay(card.value)}</div>
      <div style={{ fontSize: '0.8rem', lineHeight: 1, marginTop: 1 }}>{suitSymbol(card.suit)}</div>
      {isGolden && (
        <div
          style={{
            position: 'absolute',
            top: 1,
            right: 3,
            fontSize: '0.5rem',
            color: '#e8b84b',
            lineHeight: 1,
          }}
        >
          ★
        </div>
      )}
    </div>
  );
}

function PyramidCard({ card, label }: { card: HandCard; label?: string }) {
  const textColor = suitColor(card.suit);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {label && (
        <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
          {label}
        </div>
      )}
      <div
        style={{
          width: 64,
          height: 88,
          borderRadius: 10,
          background: '#f8f0e3',
          border: '2px solid rgba(232, 184, 75, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: textColor,
          fontWeight: 900,
          boxShadow: '0 0 20px rgba(232, 184, 75, 0.3), 0 4px 16px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{valueDisplay(card.value)}</div>
        <div style={{ fontSize: '1.2rem', lineHeight: 1, marginTop: 3 }}>{suitSymbol(card.suit)}</div>
      </div>
      <div style={{ fontSize: '0.72rem', color: 'rgba(248,240,227,0.5)' }}>
        {valueDisplay(card.value)} of {card.suit.charAt(0) + card.suit.slice(1).toLowerCase()}
      </div>
    </div>
  );
}

function PlayerBadge({ player, myHandLength, mySips }: { player: string; myHandLength: number; mySips: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 8 }}>
      <div
        style={{
          borderRadius: 999,
          padding: '6px 20px',
          background: 'rgba(45, 186, 110, 0.12)',
          border: '1px solid rgba(45, 186, 110, 0.30)',
          color: 'var(--green)',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}
      >
        {player}
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', fontWeight: 700 }}>
        <span style={{ color: 'var(--green, #2dba6e)' }}>{myHandLength} 🃏</span>
        <span style={{ color: 'var(--red, #e0403a)' }}>{mySips} 💧</span>
      </div>
    </div>
  );
}

function LeaderboardDisplay({
  leaderboard,
  player,
}: {
  leaderboard: Record<string, { sips: number; handLength: number }>;
  player: string;
}) {
  // Sort ascending by sips (fewest = best)
  const sorted = Object.entries(leaderboard).sort(([, a], [, b]) => a.sips - b.sips);
  const medals = ['🥇', '🥈', '🥉'];
  const winner = sorted[0]?.[0] ?? null;

  return (
    <div style={{ width: '100%', maxWidth: 340 }}>
      {winner && (
        <div
          style={{
            fontFamily: 'serif',
            fontSize: '1.4rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 16,
            color: '#e8b84b',
            textShadow: '0 0 24px rgba(232,184,75,0.5)',
          }}
        >
          🏆 {winner} wins!
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map(([name, stats], i) => (
          <div
            key={name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 12,
              padding: '10px 16px',
              background: name === player
                ? 'rgba(45, 186, 110, 0.12)'
                : i === 0
                ? 'rgba(232, 184, 75, 0.08)'
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${name === player ? 'rgba(45,186,110,0.35)' : i === 0 ? 'rgba(232,184,75,0.25)' : 'rgba(255,255,255,0.07)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1rem', minWidth: 22 }}>{medals[i] ?? `${i + 1}.`}</span>
              <span style={{ color: name === player ? 'var(--green, #2dba6e)' : 'var(--white, #f8f0e3)', fontWeight: 600 }}>
                {name}{name === player ? ' (you)' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: '0.8rem', fontWeight: 700 }}>
              <span style={{ color: '#2dba6e' }}>{stats.handLength} 🃏</span>
              <span style={{ color: '#e0403a' }}>{stats.sips} 💧</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResEventItem({ event, delay }: { event: ResEvent; delay: number }) {
  const style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 10,
    fontSize: '0.85rem',
    fontWeight: 600,
    width: '100%',
    maxWidth: 320,
    opacity: 0,
    animationDelay: `${delay}s`,
    animationFillMode: 'both',
  };

  if (event.type === 'protect') return (
    <div style={{ ...style, background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.4)', animation: 'golden-shimmer 0.55s ease both' }}>
      <span>🛡️</span>
      <span style={{ color: '#f8f0e3' }}>
        <b style={{ color: '#e8b84b' }}>{event.player}</b> shields <b style={{ color: '#e8b84b' }}>{event.target}</b>
      </span>
    </div>
  );

  if (event.type === 'assign') return (
    <div style={{ ...style, background: 'rgba(45,186,110,0.10)', border: '1px solid rgba(45,186,110,0.35)', animation: 'slideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
      <span>🍺</span>
      <span style={{ color: '#f8f0e3' }}>
        <b style={{ color: '#2dba6e' }}>{event.from}</b> → <b style={{ color: '#e0403a' }}>{event.to}</b>
        <span style={{ color: 'rgba(248,240,227,0.6)', fontWeight: 400 }}> {event.amount} sip{event.amount > 1 ? 's' : ''}</span>
      </span>
    </div>
  );

  if (event.type === 'redirect') return (
    <div style={{ ...style, background: 'rgba(232,184,75,0.10)', border: '1px solid rgba(232,184,75,0.35)', animation: 'slideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
      <span>🏓</span>
      <span style={{ color: '#f8f0e3' }}>
        <b style={{ color: '#e8b84b' }}>{event.from}</b> deflects → <b style={{ color: '#e0403a' }}>{event.to}</b>
        <span style={{ color: 'rgba(248,240,227,0.6)', fontWeight: 400 }}> ({event.amount} sip{event.amount > 1 ? 's' : ''})</span>
      </span>
    </div>
  );

  if (event.type === 'blocked') return (
    <div style={{ ...style, background: 'rgba(224,64,58,0.10)', border: '1px solid rgba(224,64,58,0.35)', animation: 'slideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
      <span>🚫</span>
      <span style={{ color: '#f8f0e3' }}>
        <b style={{ color: '#e0403a' }}>{event.from}</b> → <b style={{ color: '#e8b84b' }}>{event.to}</b>
        <span style={{ color: 'rgba(248,240,227,0.6)', fontWeight: 400 }}> blocked!</span>
      </span>
    </div>
  );

  return null;
}

const EFFECT_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  protect: { label: '🛡️ Shield', color: '#e8b84b', desc: 'Choose a player to protect from drinks this round.' },
  assign:  { label: '🍺 Assign', color: '#e0403a', desc: 'Choose someone to drink!' },
  redirect:{ label: '🏓 Redirect', color: '#2dba6e', desc: 'Send drinks headed your way to someone else.' },
  none:    { label: '✗ No match', color: 'rgba(255,255,255,0.35)', desc: 'This card has no effect on the current pyramid card.' },
};

export default function PartyControls({
  player, round, lap, maxLaps, sendPress, gameState,
  hand, mySips, myHandLength, leaderboard,
  declarationPhase, declarationPyramidCard, declarationSips,
  declarationAllPlayers, declared, resolutionPhase, resolutionEvents,
  onDeclare, onPass,
}: Props) {
  const options = getOptions(round);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<HandCard | null>(null);

  // Clear game-round selection when round changes
  useEffect(() => {
    setSelectedOption(null);
  }, [round]);

  // Clear card selection when declaration phase resets
  useEffect(() => {
    setSelectedCard(null);
  }, [declarationPhase, declarationPyramidCard]);

  const handleButtonPress = (option: string) => {
    setSelectedOption(option);
    sendPress(player, option);
  };

  const effect = selectedCard && declarationPyramidCard
    ? getCardEffect(selectedCard, declarationPyramidCard)
    : null;

  // Use leaderboard keys as the authoritative player list — it's populated via playerStats
  // regardless of pyramid phase, so it's always available.
  const allPlayers = Object.keys(leaderboard).length > 0
    ? Object.keys(leaderboard)
    : declarationAllPlayers;

  const effectTargets: string[] =
    effect === 'protect'
      ? allPlayers
      : effect === 'assign' || effect === 'redirect'
      ? allPlayers.filter(p => p !== player)
      : [];

  // ── End screen ──────────────────────────────────────────────────────────────
  if (gameState === 'end') {
    return (
      <div className="flex flex-col items-center px-4 py-6" style={{ minHeight: '100dvh' }}>
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, transparent, var(--gold) 50%, transparent)' }}
        />
        <PlayerBadge player={player} myHandLength={myHandLength} mySips={mySips} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, paddingTop: 24 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', color: '#e8b84b', textTransform: 'uppercase' }}>
            Final Standings
          </div>
          <LeaderboardDisplay leaderboard={leaderboard} player={player} />
          <p style={{ color: 'rgba(248,240,227,0.4)', fontSize: '0.8rem', textAlign: 'center', marginTop: 8 }}>
            Waiting for host to start again…
          </p>
        </div>
      </div>
    );
  }

  // ── Resolution screen ────────────────────────────────────────────────────────
  if (resolutionPhase) {
    return (
      <div className="flex flex-col items-center px-4 py-6" style={{ minHeight: '100dvh', gap: 16 }}>
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, transparent, var(--gold) 50%, transparent)' }}
        />
        <PlayerBadge player={player} myHandLength={myHandLength} mySips={mySips} />
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', color: '#e8b84b', textTransform: 'uppercase', marginTop: 8 }}>
          Resolution
        </div>
        {resolutionEvents.length === 0 ? (
          <p style={{ color: 'rgba(248,240,227,0.5)', fontSize: '0.9rem', textAlign: 'center' }}>
            No declarations — everyone passes!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
            {resolutionEvents.map((event, i) => (
              <ResEventItem key={i} event={event} delay={i * 0.35} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Pyramid declaration screen (show whenever not yet declared, card or not) ──
  if (gameState === 'pyramid' && !declared) {
    const cardFlipped = !!declarationPyramidCard;

    // A card is playable if it has any effect (value match, suit match, or golden)
    const isPlayable = (card: HandCard) =>
      !declarationPyramidCard
        ? false
        : getCardEffect(card, declarationPyramidCard) !== 'none';

    const canTarget = cardFlipped && !!selectedCard && !!effect && effect !== 'none';

    const effectColor =
      effect === 'protect' ? '#e8b84b' :
      effect === 'redirect' ? '#2dba6e' :
      '#e0403a';

    return (
      <div className="flex flex-col items-center px-4 py-5" style={{ minHeight: '100dvh', gap: 14 }}>
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, transparent, var(--gold) 50%, transparent)' }}
        />

        <PlayerBadge player={player} myHandLength={myHandLength} mySips={mySips} />

        {/* Pyramid card — or placeholder while waiting for flip */}
        {cardFlipped ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', color: '#e8b84b', textTransform: 'uppercase' }}>
              Pyramid Card — {declarationSips} sip{declarationSips > 1 ? 's' : ''}
            </div>
            <PyramidCard card={declarationPyramidCard!} />
          </div>
        ) : (
          <p style={{ color: 'rgba(248,240,227,0.45)', fontSize: '0.85rem' }} className="animate-pulse">
            Watching for card flip…
          </p>
        )}

        {/* Player list — always visible; rows become tap targets once a playable card is selected */}
        {allPlayers.length > 0 && (
          <div style={{ width: '100%', maxWidth: 340 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 8, textTransform: 'uppercase' }}>
              Players
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {allPlayers.map(name => {
                const isMe = name === player;
                const isTarget = canTarget && effectTargets.includes(name);

                return (
                  <button
                    key={name}
                    disabled={!isTarget}
                    onClick={isTarget ? () => onDeclare(selectedCard!.code, selectedCard!.golden === true, name) : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      borderRadius: 12,
                      padding: '11px 16px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      background: isTarget
                        ? `${effectColor}1a`
                        : isMe
                        ? 'rgba(45, 186, 110, 0.08)'
                        : 'rgba(255,255,255,0.04)',
                      border: isTarget
                        ? `1.5px solid ${effectColor}66`
                        : isMe
                        ? '1px solid rgba(45,186,110,0.25)'
                        : '1px solid rgba(255,255,255,0.08)',
                      color: isMe ? 'var(--green, #2dba6e)' : 'var(--white, #f8f0e3)',
                      cursor: isTarget ? 'pointer' : 'default',
                      transition: 'background 0.15s, border 0.15s',
                    }}
                  >
                    <span>{name}{isMe ? ' (me)' : ''}</span>
                    {isTarget && (
                      <span style={{ fontSize: '0.75rem', color: effectColor, fontWeight: 700 }}>
                        {effect === 'protect' ? '🛡️ Shield' : effect === 'redirect' ? '🏓 Send' : '🍺 Give'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Your hand — playable cards are full-opacity and clickable; dead cards are dimmed */}
        {hand.length > 0 ? (
          <div style={{ width: '100%', maxWidth: 340 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 8, textTransform: 'uppercase' }}>
              {cardFlipped ? 'Select a card to play' : 'Your hand'}
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                justifyContent: 'center',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              {hand.map((card, i) => {
                const playable = isPlayable(card);
                const isSelected = selectedCard?.code === card.code && selectedCard?.golden === card.golden;
                return (
                  <div
                    key={i}
                    style={{
                      opacity: !cardFlipped || playable ? 1 : 0.3,
                      transition: 'opacity 0.2s',
                      pointerEvents: cardFlipped && playable ? 'auto' : 'none',
                    }}
                  >
                    <MiniCard
                      card={card}
                      selected={isSelected}
                      onClick={() => setSelectedCard(card)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textAlign: 'center' }}>
            You have no cards — pass this round.
          </p>
        )}

        {/* Effect display */}
        {selectedCard && effect && cardFlipped && (
          <div
            style={{
              width: '100%',
              maxWidth: 320,
              borderRadius: 12,
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${EFFECT_LABELS[effect]?.color}44`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: 700, color: EFFECT_LABELS[effect]?.color, fontSize: '0.95rem', marginBottom: 4 }}>
              {EFFECT_LABELS[effect]?.label}
            </div>
            <div style={{ color: 'rgba(248,240,227,0.6)', fontSize: '0.8rem' }}>
              {EFFECT_LABELS[effect]?.desc}
            </div>
          </div>
        )}

        {/* Pass button — unlocks once pyramid card is known */}
        <button
          onClick={cardFlipped ? onPass : undefined}
          disabled={!cardFlipped}
          style={{
            borderRadius: 14,
            padding: '12px 32px',
            fontWeight: 600,
            fontSize: '0.9rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: cardFlipped ? 'rgba(248,240,227,0.55)' : 'rgba(248,240,227,0.2)',
            cursor: cardFlipped ? 'pointer' : 'not-allowed',
            marginTop: 4,
          }}
        >
          Pass
        </button>
      </div>
    );
  }

  // ── Pyramid waiting screen (only after player has declared/passed) ──────────
  if (gameState === 'pyramid' && declared) {
    return (
      <div
        className="flex flex-col items-center justify-between px-4 py-6"
        style={{ minHeight: '100dvh' }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, transparent, var(--gold) 50%, transparent)' }}
        />
        <PlayerBadge player={player} myHandLength={myHandLength} mySips={mySips} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ color: '#e8b84b', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            Pyramid Phase
          </div>
          <p style={{ color: 'rgba(248,240,227,0.6)', fontSize: '0.9rem' }} className="animate-pulse">
            {declared ? 'Waiting for others…' : 'Watching for a card flip…'}
          </p>
          {/* Show hand passively */}
          {hand.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                justifyContent: 'center',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.10)',
                maxWidth: 320,
                marginTop: 8,
              }}
            >
              {hand.map((card, i) => (
                <MiniCard key={i} card={card} />
              ))}
            </div>
          )}
        </div>
        <div style={{ height: 24 }} />
      </div>
    );
  }

  // ── Normal round UI ──────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col items-center justify-between px-4 py-6"
      style={{ minHeight: '100dvh' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, transparent, var(--gold) 50%, transparent)' }}
      />

      <PlayerBadge player={player} myHandLength={myHandLength} mySips={mySips} />

      <div className="text-center flex-1 flex flex-col items-center justify-center gap-2 py-4">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
          <div style={{ color: '#e8b84b', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Round {round}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>•</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Lap {lap}/{maxLaps}
          </div>
        </div>
        <h2 style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', color: 'var(--white, #f8f0e3)', fontWeight: 700, fontFamily: 'serif', lineHeight: 1.2 }}>
          {ROUND_LABELS[round] ?? '…'}
        </h2>
        <p style={{ color: 'rgba(248,240,227,0.6)', fontSize: '0.9rem', maxWidth: 280 }}>
          {ROUND_SUBLABELS[round] ?? ''}
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-row flex-wrap justify-center pb-3">
        {options.map((opt) => (
          <PartyButton key={opt} option={opt} isSelected={selectedOption === opt} onPress={handleButtonPress} />
        ))}
      </div>

      {hand.length > 0 && (
        <div style={{ width: '100%', maxWidth: 340, paddingBottom: 8 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', color: '#e8b84b', textAlign: 'center', marginBottom: 6, textTransform: 'uppercase' }}>
            Your Hand ({hand.length} card{hand.length !== 1 ? 's' : ''})
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              justifyContent: 'center',
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            {hand.map((card, i) => (
              <MiniCard key={i} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
