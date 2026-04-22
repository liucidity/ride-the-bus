import React, { useEffect, useState, useRef } from 'react';
import Timer from './Timer';
import Message from './Message';
import Card from './Card';
import ReactCardFlip from 'react-card-flip';
import { io, Socket } from 'socket.io-client';
import { usePartyApplicationData } from '../helpers/usePartyApplicationData';

// ── Types ───────────────────────────────────────────────────────────────────────
type Declaration = {
  player: string;
  cardCode: string;
  cardGolden: boolean;
  target: string;
};

type ResEvent =
  | { type: 'assign'; from: string; to: string; amount: number }
  | { type: 'redirect'; from: string; to: string; amount: number }
  | { type: 'protect'; player: string; target: string }
  | { type: 'blocked'; from: string; to: string; amount: number }
  | { type: 'shot'; from: string; target: string }
  | { type: 'sipAll'; from: string; except: string }
  | { type: 'buddy'; player: string; target: string }
  | { type: 'gift'; from: string; to: string; count: number };

// ── Dynamic pyramid layout ──────────────────────────────────────────────────────
// Returns rows top-to-bottom (highest sips at top) for n cards.
// Triangular layout: bottom row = k cards (1 sip), top row = 1 card (k sips).
function buildPyramidRows(n: number): { indices: number[]; sips: number }[] {
  // Find largest k where k*(k+1)/2 <= n
  let k = 0;
  while ((k + 1) * (k + 2) / 2 <= n) k++;

  const rows: { indices: number[]; sips: number }[] = [];
  let idx = 0;
  // Build bottom-to-top: row 1 has k cards (1 sip), row k has 1 card (k sips)
  for (let row = 1; row <= k; row++) {
    const rowSize = k - row + 1;
    const indices: number[] = [];
    for (let i = 0; i < rowSize; i++) indices.push(idx++);
    rows.push({ indices, sips: row });
  }
  // Merge any remainder into the existing top row (sips = k) to avoid a duplicate row
  if (idx < n && rows.length > 0) {
    const topRow = rows[rows.length - 1];
    while (idx < n) topRow.indices.push(idx++);
  }
  // Reverse so highest sips display at top
  return rows.reverse();
}

// ── Value → deck API code ───────────────────────────────────────────────────────
function valueToApiCode(value: number): string {
  if (value === 14) return 'A';
  if (value === 13) return 'K';
  if (value === 12) return 'Q';
  if (value === 11) return 'J';
  if (value === 10) return '0';
  return String(value);
}

const SHOT_SIPS = 3;

// ── Resolution logic ────────────────────────────────────────────────────────────
function resolveDeclarations(
  pyramidCard: any,
  declarations: Declaration[],
  players: Record<string, any>,
  currentSips: number,
  drinkingBuddies: Record<string, string>
): {
  events: ResEvent[];
  drinkMap: Record<string, number>;
  newBuddyLinks: Record<string, string>;
  giftTargets: { player: string; cards: any[] }[];
} {
  const events: ResEvent[] = [];
  const protectedPlayers = new Set<string>();
  const drinkMap: Record<string, number> = {};
  const newBuddyLinks: Record<string, string> = {};
  const giftTargets: { player: string; cards: any[] }[] = [];
  const allPlayerNames = Object.keys(players);

  const getHandCard = (player: string, cardCode: string) =>
    (players[player]?.hand || []).find((c: any) => c.code === cardCode) ?? null;

  // Step 1: Golden Hearts → protect target
  declarations.forEach(({ player, cardCode, cardGolden, target }) => {
    if (!cardGolden) return;
    const handCard = getHandCard(player, cardCode);
    if (!handCard || handCard.suit !== 'HEARTS') return;
    protectedPlayers.add(target);
    events.push({ type: 'protect', player, target });
  });

  // Step 2: Golden Clubs → link drinking buddies
  declarations.forEach(({ player, cardCode, cardGolden, target }) => {
    if (!cardGolden) return;
    const handCard = getHandCard(player, cardCode);
    if (!handCard || handCard.suit !== 'CLUBS') return;
    newBuddyLinks[player] = target;
    newBuddyLinks[target] = player;
    events.push({ type: 'buddy', player, target });
  });

  // Step 3: Value matches (non-golden) → assign drinks
  declarations.forEach(({ player, cardCode, cardGolden, target }) => {
    if (cardGolden) return;
    const handCard = getHandCard(player, cardCode);
    if (!handCard || handCard.value !== pyramidCard.value) return;
    if (protectedPlayers.has(target)) {
      events.push({ type: 'blocked', from: player, to: target, amount: currentSips });
    } else {
      drinkMap[target] = (drinkMap[target] || 0) + currentSips;
      events.push({ type: 'assign', from: player, to: target, amount: currentSips });
    }
  });

  // Step 4: Golden Spades → target takes a shot, everyone else sips
  declarations.forEach(({ player, cardCode, cardGolden, target }) => {
    if (!cardGolden) return;
    const handCard = getHandCard(player, cardCode);
    if (!handCard || handCard.suit !== 'SPADES') return;
    if (protectedPlayers.has(target)) {
      events.push({ type: 'blocked', from: player, to: target, amount: SHOT_SIPS });
    } else {
      drinkMap[target] = (drinkMap[target] || 0) + SHOT_SIPS;
      events.push({ type: 'shot', from: player, target });
    }
    // Everyone else sips
    let anyElse = false;
    allPlayerNames.forEach(name => {
      if (name === target) return;
      if (!protectedPlayers.has(name)) {
        drinkMap[name] = (drinkMap[name] || 0) + 1;
        anyElse = true;
      }
    });
    if (anyElse) events.push({ type: 'sipAll', from: player, except: target });
  });

  // Step 5: Suit matches (non-golden, non-value-match) → redirect drinks aimed at me
  declarations.forEach(({ player, cardCode, cardGolden, target }) => {
    if (cardGolden) return;
    const handCard = getHandCard(player, cardCode);
    if (!handCard || handCard.suit !== pyramidCard.suit || handCard.value === pyramidCard.value) return;
    const sipsComingToMe = drinkMap[player] || 0;
    if (sipsComingToMe <= 0) return;
    if (protectedPlayers.has(target)) {
      events.push({ type: 'blocked', from: player, to: target, amount: sipsComingToMe });
    } else {
      delete drinkMap[player];
      drinkMap[target] = (drinkMap[target] || 0) + sipsComingToMe;
      events.push({ type: 'redirect', from: player, to: target, amount: sipsComingToMe });
    }
  });

  // Step 6: Golden Diamonds → gift target all 4 suits of pyramid card's value
  declarations.forEach(({ player, cardCode, cardGolden, target }) => {
    if (!cardGolden) return;
    const handCard = getHandCard(player, cardCode);
    if (!handCard || handCard.suit !== 'DIAMONDS') return;
    const vc = valueToApiCode(pyramidCard.value);
    const giftCards = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'].map(suit => ({
      value: pyramidCard.value,
      suit,
      code: `${vc}${suit[0]}`,
      image: `https://deckofcardsapi.com/static/img/${vc}${suit[0]}.png`,
      golden: false,
    }));
    events.push({ type: 'gift', from: player, to: target, count: 4 });
    giftTargets.push({ player: target, cards: giftCards });
  });

  // Step 7: Apply drinking buddy effect (existing + newly formed)
  const allBuddies = { ...drinkingBuddies, ...newBuddyLinks };
  const buddyAdditions: Record<string, number> = {};
  Object.entries(drinkMap).forEach(([p, amount]) => {
    const buddy = allBuddies[p];
    if (buddy && !protectedPlayers.has(buddy)) {
      buddyAdditions[buddy] = (buddyAdditions[buddy] || 0) + amount;
    }
  });
  Object.entries(buddyAdditions).forEach(([p, amount]) => {
    drinkMap[p] = (drinkMap[p] || 0) + amount;
  });

  return { events, drinkMap, newBuddyLinks, giftTargets };
}

// ── Resolution overlay ──────────────────────────────────────────────────────────
function ResEventCard({ event }: { event: ResEvent }) {
  if (event.type === 'protect') {
    return (
      <div className="res-event-protect" style={{ animation: 'slide-bounce-in 0.5s ease both' }}>
        <span className="res-icon">🛡️</span>
        <span className="res-text">
          <b style={{ color: 'var(--gold)' }}>{event.player}</b>
          {' '}shields{' '}
          <b style={{ color: 'var(--gold)' }}>{event.target}</b>
        </span>
      </div>
    );
  }

  if (event.type === 'assign') {
    return (
      <div className="res-event-assign" style={{ animation: 'slide-bounce-in 0.5s ease both' }}>
        <span className="res-icon">🍺</span>
        <span className="res-text">
          <b style={{ color: 'var(--green)' }}>{event.from}</b>
          {' '}→ <b style={{ color: 'var(--red)' }}>{event.to}</b>
          {' '}<span style={{ color: 'var(--white-dim)' }}>drinks {event.amount} sip{event.amount > 1 ? 's' : ''}</span>
        </span>
      </div>
    );
  }

  if (event.type === 'redirect') {
    return (
      <div className="res-event-redirect" style={{ animation: 'slide-bounce-in 0.5s ease both' }}>
        <span className="res-icon">🏓</span>
        <span className="res-text">
          <b style={{ color: 'var(--gold)' }}>{event.from}</b>
          {' '}deflects → <b style={{ color: 'var(--red)' }}>{event.to}</b>
          {' '}<span style={{ color: 'var(--white-dim)' }}>({event.amount} sip{event.amount > 1 ? 's' : ''})</span>
        </span>
      </div>
    );
  }

  if (event.type === 'blocked') {
    return (
      <div className="res-event-blocked" style={{ animation: 'slide-bounce-in 0.5s ease both' }}>
        <span className="res-icon">🚫</span>
        <span className="res-text">
          <b style={{ color: 'var(--red)' }}>{event.from}</b>
          {' '}→ <b style={{ color: 'var(--gold)' }}>{event.to}</b>
          {' '}<span style={{ color: 'var(--white-dim)' }}>blocked! ({event.amount} sip{event.amount > 1 ? 's' : ''})</span>
        </span>
      </div>
    );
  }

  if (event.type === 'shot') {
    return (
      <div style={{ animation: 'slide-bounce-in 0.5s ease both', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.45)' }}>
        <span className="res-icon">🥃</span>
        <span className="res-text">
          <b style={{ color: '#ff6b35' }}>{event.from}</b>
          {' '}→ <b style={{ color: 'var(--red)' }}>{event.target}</b>
          {' '}<span style={{ color: 'var(--white-dim)' }}>takes a SHOT!</span>
        </span>
      </div>
    );
  }

  if (event.type === 'sipAll') {
    return (
      <div style={{ animation: 'slide-bounce-in 0.5s ease both', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'rgba(45,186,110,0.08)', border: '1px solid rgba(45,186,110,0.25)' }}>
        <span className="res-icon">💧</span>
        <span className="res-text">
          <b style={{ color: '#ff6b35' }}>{event.from}</b>
          {' '}<span style={{ color: 'var(--white-dim)' }}>→ everyone else sips</span>
        </span>
      </div>
    );
  }

  if (event.type === 'buddy') {
    return (
      <div style={{ animation: 'slide-bounce-in 0.5s ease both', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.40)' }}>
        <span className="res-icon">🤝</span>
        <span className="res-text">
          <b style={{ color: '#a855f7' }}>{event.player}</b>
          {' '}&amp;{' '}<b style={{ color: '#a855f7' }}>{event.target}</b>
          {' '}<span style={{ color: 'var(--white-dim)' }}>are now drinking buddies!</span>
        </span>
      </div>
    );
  }

  if (event.type === 'gift') {
    return (
      <div style={{ animation: 'slide-bounce-in 0.5s ease both', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'rgba(78,205,196,0.10)', border: '1px solid rgba(78,205,196,0.40)' }}>
        <span className="res-icon">💎</span>
        <span className="res-text">
          <b style={{ color: '#4ecdc4' }}>{event.from}</b>
          {' '}→ <b style={{ color: '#4ecdc4' }}>{event.to}</b>
          {' '}<span style={{ color: 'var(--white-dim)' }}>receives {event.count} cards!</span>
        </span>
      </div>
    );
  }

  return null;
}

const RESOLUTION_EVENT_INTERVAL_MS = 1800;

function PyramidResolutionOverlay({ events }: { events: ResEvent[] }) {
  const [visibleCount, setVisibleCount] = React.useState(0);

  React.useEffect(() => {
    setVisibleCount(events.length === 0 ? 1 : 0);
    if (events.length === 0) return;
    const timers = events.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), i * RESOLUTION_EVENT_INTERVAL_MS)
    );
    return () => timers.forEach(clearTimeout);
  }, [events]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        background: 'rgba(6, 20, 12, 0.88)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: 8,
          animation: 'fade-in 0.3s ease both',
        }}
      >
        Resolution
      </div>
      {events.length === 0 ? (
        visibleCount > 0 && (
          <div
            style={{
              color: 'var(--white-dim)',
              fontSize: '0.9rem',
              animation: 'slide-bounce-in 0.5s ease both',
            }}
          >
            No declarations — everyone passes!
          </div>
        )
      ) : (
        events.slice(0, visibleCount).map((event, i) => (
          <ResEventCard key={i} event={event} />
        ))
      )}
    </div>
  );
}

// ── Shuffle animation ──────────────────────────────────────────────────────────
function ShuffleAnimation() {
  const rotations = [-14, -7, 0, 7, 14];
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-12 animate-fade-in">
      <div className="relative" style={{ width: 90, height: 126 }}>
        {rotations.map((rot, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 8,
              background: 'linear-gradient(145deg, #1a4a2e 0%, #0e2518 100%)',
              border: '1px solid rgba(45, 186, 110, 0.28)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.55)',
              transform: `rotate(${rot}deg)`,
              animation: `card-shuffle 0.55s ease-in-out ${i * 0.075}s infinite alternate`,
            }}
          />
        ))}
      </div>
      <p
        style={{
          color: 'var(--gold)',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        Shuffling…
      </p>
    </div>
  );
}

// ── End-screen leaderboard ─────────────────────────────────────────────────────
function EndLeaderboard({ players, winner }: { players: Record<string, any>; winner: string | null }) {
  // Sort descending by sips (most drinks first)
  const sorted = Object.entries(players).sort(([, a], [, b]) => (b.sips || 0) - (a.sips || 0));
  const medals = ['🍺', '💧', '💦'];
  return (
    <div className="w-full max-w-sm mx-auto mt-2">
      <div
        className="text-xs font-semibold uppercase tracking-widest text-center mb-3"
        style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}
      >
        Most Drinks
      </div>
      <div className="flex flex-col gap-2">
        {sorted.map(([name, p], i) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{
              background: i === 0 ? 'rgba(232,184,75,0.10)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${i === 0 ? 'rgba(232,184,75,0.35)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '1.1rem', minWidth: 24 }}>{medals[i] ?? `${i + 1}.`}</span>
              <span style={{ color: 'var(--white)', fontWeight: 600 }}>{name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <span style={{ color: 'var(--green)' }}>
                {(p.hand || []).length} card{(p.hand || []).length !== 1 ? 's' : ''}
              </span>
              <span style={{ color: 'var(--red)' }}>
                {p.sips || 0} sip{(p.sips || 0) !== 1 ? 's' : ''} 💧
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Running leaderboard (fixed top-left) ──────────────────────────────────────
function RunningLeaderboard({ players }: { players: Record<string, any> }) {
  // Sort ascending by sips (fewest = best)
  const sorted = Object.entries(players).sort(([, a], [, b]) => (a.sips || 0) - (b.sips || 0));
  if (sorted.length === 0) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 72,
        left: 16,
        zIndex: 20,
        width: 230,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: 2,
        }}
      >
        Leaderboard
      </div>
      {sorted.map(([name, p], i) => (
        <div
          key={name}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 10,
            padding: '8px 14px',
            background: i === 0 ? 'rgba(232,184,75,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${i === 0 ? 'rgba(232,184,75,0.25)' : 'rgba(255,255,255,0.07)'}`,
          }}
        >
          <span
            style={{
              color: i === 0 ? 'var(--gold)' : 'var(--white)',
              fontSize: '0.95rem',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 110,
            }}
          >
            {name}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <span style={{ color: 'var(--green)', fontSize: '0.85rem', fontWeight: 700 }}>
              {(p.hand || []).length} 🃏
            </span>
            <span style={{ color: 'var(--red)', fontSize: '0.8rem', fontWeight: 600 }}>
              {p.sips || 0} 💧
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Sip colour helper ──────────────────────────────────────────────────────────
function sipColor(sips: number): string {
  if (sips >= 4) return '#ff44aa';
  if (sips === 3) return 'var(--red)';
  if (sips === 2) return 'var(--gold)';
  return 'var(--white-dim)';
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PartyGame() {
  const {
    state,
    updateDeck,
    handleRound,
    createPlayer,
    disconnectPlayer,
    handleSelection,
    setTimer,
    startGameStatus,
    resetState,
    addSips,
    addToHand,
    addCardsToHand,
    removeFromHand,
    setDrinkingBuddy,
    pyramidFlipNext,
    finishPyramidPhase,
    enterPyramidPhase,
  } = usePartyApplicationData();

  const [initialState, setInitialState] = useState({});
  const [shuffling, setShuffling] = useState(false);
  const [showResolution, setShowResolution] = useState(false);
  const [resolutionEvents, setResolutionEvents] = useState<ResEvent[]>([]);
  const [pyramidCountdown, setPyramidCountdown] = useState<number | null>(null);
  const declarationsRef = useRef<Declaration[]>([]);
  const prevHandsRef = useRef<Record<string, string>>({});
  const pyramidCountdownRef = useRef<number | null>(null);
  const pyramidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pyramidIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pyramidResolveRef = useRef<(() => void) | null>(null);
  const pyramidReadyCountRef = useRef(0);
  const pyramidPlayerCountRef = useRef(0);
  const gameState = state.gameState;
  const socketRef = useRef<Socket>();

  const checkEarlyResolve = () => {
    if (
      pyramidReadyCountRef.current >= pyramidPlayerCountRef.current &&
      pyramidPlayerCountRef.current > 0
    ) {
      const remaining = pyramidCountdownRef.current;
      if (remaining !== null && remaining > 3 && pyramidTimerRef.current) {
        clearTimeout(pyramidTimerRef.current);
        pyramidCountdownRef.current = 3;
        setPyramidCountdown(3);
        pyramidTimerRef.current = setTimeout(() => pyramidResolveRef.current?.(), 3000);
      }
    }
  };

  const startGame = async () => {
    setShuffling(true);

    if (gameState !== 'end') {
      setInitialState({ ...state });
    } else {
      resetState(initialState);
    }

    await new Promise<void>(r => setTimeout(r, 1400));
    setShuffling(false);

    if (gameState === 'end') {
      await updateDeck('reshuffle');
    }
    await updateDeck('draw');
    startGameStatus();
    setTimer(-1);
  };

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'https://ride-the-bus-socket.onrender.com', {
      transports: ['websocket', 'polling', 'flashsocket'],
    });
    updateDeck('new');

    socketRef.current.on('connect', () => console.log(socketRef.current!.id));
    socketRef.current.on('connect_error', () => {
      setTimeout(() => socketRef.current!.connect(), 5000);
    });
    socketRef.current.on('setUser', (username, socketId) => createPlayer(username, socketId));
    socketRef.current.on('buttonPress', (player, choice) => handleSelection(player, choice));
    socketRef.current.on('disconnectPlayer', (id) => disconnectPlayer(id));
    socketRef.current.on('pyramidDeclare', (player: string, cardCode: string, cardGolden: boolean, target: string) => {
      declarationsRef.current.push({ player, cardCode, cardGolden, target });
      pyramidReadyCountRef.current++;
      checkEarlyResolve();
    });
    socketRef.current.on('pyramidPass', () => {
      pyramidReadyCountRef.current++;
      checkEarlyResolve();
    });

    return () => {
      socketRef.current!.off('connect');
      socketRef.current!.off('disconnect');
      socketRef.current!.off('buttonPress');
      socketRef.current!.off('pyramidDeclare');
      socketRef.current!.off('pyramidPass');
      socketRef.current!.disconnect();
    };
  }, []);

  useEffect(() => {
    socketRef.current?.emit('round', state.round);
  }, [state.round]);

  useEffect(() => {
    socketRef.current?.emit('lap', state.lap, state.maxLaps);
  }, [state.lap]);

  useEffect(() => {
    socketRef.current?.emit('gameState', state.gameState);
  }, [state.gameState]);

  // Emit hand updates + player stats whenever player data changes
  useEffect(() => {
    
    if (!socketRef.current) return;
    const stats: Record<string, { sips: number; handLength: number }> = {};

    Object.keys(state.players).forEach(player => {
      const hand = state.players[player].hand || [];
      const serialized = JSON.stringify(hand);
      if (serialized !== prevHandsRef.current[player]) {
        prevHandsRef.current[player] = serialized;
        socketRef.current?.emit('handUpdate', player, hand);
      }
      stats[player] = {
        sips: state.players[player].sips || 0,
        handLength: hand.length,
      };
    });
    console.log('Emitting playerStats:', stats)
    socketRef.current?.emit('playerStats', stats);
  }, [state.players]);

  // Auto-start 3-second countdown when all players have submitted
  useEffect(() => {
    if (gameState !== 'running') return;
    if (state.timer !== -1) return;
    const names = Object.keys(state.players);
    if (names.length === 0) return;
    const allSubmitted = names.every(p => state.players[p].choice !== '');
    if (allSubmitted) setTimer(3);
  }, [state.players, state.timer, gameState]);

  // Pyramid phase: 10s declaration window (early-skip to 3s when all done) → resolve → animate → advance
  useEffect(() => {
    if (state.gameState !== 'pyramid' || state.pyramidCards.length === 0) return;

    if (state.pyramidIndex >= state.pyramidCards.length) {
      finishPyramidPhase();
      return;
    }

    const currentCard = state.pyramidCards[state.pyramidIndex];
    const currentSips = state.pyramidSips[state.pyramidIndex];
    const playerNames = Object.keys(state.players);

    declarationsRef.current = [];
    pyramidReadyCountRef.current = 0;
    pyramidPlayerCountRef.current = playerNames.length;

    const DECLARE_WINDOW_MS = 30000;

    const setCountdown = (val: number | null) => {
      pyramidCountdownRef.current = val;
      setPyramidCountdown(val);
    };
    setCountdown(DECLARE_WINDOW_MS / 1000);

    const resolve = () => {
      if (pyramidIntervalRef.current) { clearInterval(pyramidIntervalRef.current); pyramidIntervalRef.current = null; }
      if (pyramidTimerRef.current) { clearTimeout(pyramidTimerRef.current); pyramidTimerRef.current = null; }
      setCountdown(null);

      const { events, drinkMap, newBuddyLinks, giftTargets } = resolveDeclarations(
        currentCard,
        declarationsRef.current,
        state.players,
        currentSips,
        state.drinkingBuddies || {}
      );

      Object.entries(drinkMap).forEach(([player, sips]) => {
        if (sips > 0) addSips(player, sips);
      });

      // Remove used cards from player hands
      declarationsRef.current.forEach(({ player, cardCode }) => {
        removeFromHand(player, cardCode);
      });

      // Gift cards (golden diamonds)
      giftTargets.forEach(({ player, cards }) => {
        addCardsToHand(player, cards);
      });

      // Persist new buddy links (golden clubs)
      Object.entries(newBuddyLinks).forEach(([player, buddy]) => {
        if (player < buddy) setDrinkingBuddy(player, buddy); // call once per pair
      });

      socketRef.current?.emit('pyramidResolution', events);
      setResolutionEvents(events);
      setShowResolution(true);

      const displayMs = Math.max(4000, events.length * RESOLUTION_EVENT_INTERVAL_MS + 2500);
      setTimeout(() => {
        setShowResolution(false);
        pyramidFlipNext();
      }, displayMs);
    };

    pyramidResolveRef.current = resolve;

    pyramidIntervalRef.current = setInterval(() => {
      const cur = pyramidCountdownRef.current;
      if (cur !== null && cur > 0) {
        pyramidCountdownRef.current = cur - 1;
        setPyramidCountdown(cur - 1);
      }
    }, 1000);

    pyramidTimerRef.current = setTimeout(resolve, DECLARE_WINDOW_MS);

    socketRef.current?.emit('pyramidDeclarePhase', state.pyramidIndex, currentCard, currentSips, playerNames);

    return () => {
      if (pyramidIntervalRef.current) { clearInterval(pyramidIntervalRef.current); pyramidIntervalRef.current = null; }
      if (pyramidTimerRef.current) { clearTimeout(pyramidTimerRef.current); pyramidTimerRef.current = null; }
      setCountdown(null);
    };
  }, [state.pyramidIndex, state.gameState, state.pyramidCards.length]);

  const playerNames = Object.keys(state.players);
  const pyramidRows = buildPyramidRows(state.pyramidCards.length);

  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-10 min-h-screen">

      {/* Resolution overlay */}
      {showResolution && <PyramidResolutionOverlay events={resolutionEvents} />}

      {/* Fixed leaderboard */}
      {(gameState === 'running' || gameState === 'pyramid') && (
        <RunningLeaderboard players={state.players} />
      )}

      {/* Connect banner */}
      <div
        className="mb-6 text-center rounded-xl px-6 py-3 text-sm"
        style={{
          background: 'rgba(45, 186, 110, 0.07)',
          border: '1px solid rgba(45, 186, 110, 0.20)',
          color: 'var(--white-dim)',
        }}
      >
        Join at{' '}
        <a
          href="https://ride-the-bus-player.onrender.com"
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline-offset-2 underline"
          style={{ color: 'var(--green)' }}
        >
          ride-the-bus-player.onrender.com
        </a>{' '}
        on your device
      </div>

      {shuffling && <ShuffleAnimation />}

      {/* Lobby */}
      {!shuffling && gameState === 'paused' && (
        <div className="flex flex-col items-center gap-4 w-full max-w-md animate-fade-in">
          {playerNames.length > 0 && (
            <>
              <p className="font-display italic text-base" style={{ color: 'var(--white-dim)' }}>
                Players ready:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {playerNames.map((player) => (
                  <span
                    key={player}
                    className="rounded-full px-4 py-1.5 text-sm font-semibold"
                    style={{
                      background: 'rgba(45, 186, 110, 0.12)',
                      border: '1px solid rgba(45, 186, 110, 0.35)',
                      color: 'var(--green)',
                    }}
                  >
                    {player} ✓
                  </span>
                ))}
              </div>
            </>
          )}

          {playerNames.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--white-dim)' }}>
              Waiting for players to join…
            </p>
          )}

          <button
            className="mt-6 rounded-full font-semibold uppercase tracking-widest text-sm transition-all duration-200 hover:scale-105"
            style={{
              padding: '14px 44px',
              background: 'linear-gradient(135deg, var(--green) 0%, #1e8a4e 100%)',
              color: 'var(--bg)',
              boxShadow: '0 8px 28px rgba(45, 186, 110, 0.35)',
              letterSpacing: '0.14em',
            }}
            onClick={startGame}
          >
            Start Game
          </button>

          {playerNames.length > 0 && (
            <button
              className="rounded-full font-semibold uppercase tracking-widest text-xs transition-all duration-200 hover:scale-105"
              style={{
                padding: '10px 28px',
                background: 'rgba(232, 184, 75, 0.10)',
                border: '1px solid rgba(232, 184, 75, 0.35)',
                color: 'var(--gold)',
                letterSpacing: '0.12em',
              }}
              onClick={() => {
                const API_IMG = (code: string) => `https://deckofcardsapi.com/static/img/${code}.png`;
                const seedCards = [
                  { value: 2,  suit: 'HEARTS',   code: '2H',  image: API_IMG('2H'),  golden: false },
                  { value: 5,  suit: 'CLUBS',    code: '5C',  image: API_IMG('5C'),  golden: false },
                  { value: 7,  suit: 'DIAMONDS', code: '7D',  image: API_IMG('7D'),  golden: true  },
                  { value: 10, suit: 'SPADES',   code: '0S',  image: API_IMG('0S'),  golden: false },
                  { value: 14, suit: 'HEARTS',   code: 'AH',  image: API_IMG('AH'),  golden: true  },
                ];
                playerNames.forEach(p => seedCards.forEach(c => addToHand(p, c)));
                enterPyramidPhase();
              }}
            >
              Test Pyramid
            </button>
          )}
        </div>
      )}

      {/* End screen */}
      {!shuffling && gameState === 'end' && (
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto animate-fade-in gap-6">
          {/* Winner banner */}
          {state.winner && (
            <div
              className="font-display text-3xl font-bold text-center animate-slide-up"
              style={{ color: 'var(--gold)', textShadow: '0 0 30px rgba(232,184,75,0.5)' }}
            >
              🏆 {state.winner} wins!
            </div>
          )}

          {/* Pyramid + leaderboard row */}
          <div className="flex flex-row items-start justify-center gap-10 flex-wrap w-full">
            {/* Pyramid centered */}
            {state.pyramidCards.length > 0 && (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}
                >
                  Pyramid
                </div>
                {pyramidRows.map(({ indices, sips }, rowIdx) => (
                  <div key={rowIdx} className="flex flex-col items-center gap-1">
                    <div className="text-xs font-semibold mb-1" style={{ color: sipColor(sips) }}>
                      {sips} sip{sips > 1 ? 's' : ''}
                    </div>
                    <div className="flex flex-row gap-2 justify-center">
                      {indices.map(i => (
                        <ReactCardFlip key={i} isFlipped={true} flipDirection="horizontal">
                          <Card value="card-back" image="blue-card-back.png" />
                          <Card value={state.pyramidCards[i]?.code} image={state.pyramidCards[i]?.image} />
                        </ReactCardFlip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Most drinks leaderboard */}
            <EndLeaderboard players={state.players} winner={state.winner} />
          </div>

          <button
            className="rounded-full font-semibold uppercase tracking-widest text-sm transition-all duration-200 hover:scale-105"
            style={{
              padding: '14px 44px',
              background: 'linear-gradient(135deg, var(--green) 0%, #1e8a4e 100%)',
              color: 'var(--bg)',
              boxShadow: '0 8px 28px rgba(45, 186, 110, 0.35)',
              letterSpacing: '0.14em',
            }}
            onClick={startGame}
          >
            Play Again
          </button>
        </div>
      )}

      {/* Running state */}
      {!shuffling && gameState === 'running' && (
        <div className="flex flex-col items-center">
          <div
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}
          >
            Lap {state.lap} of {state.maxLaps}
          </div>
          <div className="flex flex-row flex-wrap justify-center gap-2 sm:gap-3 my-6 animate-scale-in">
            {state.card.map && state.card.map((card: any, index: number) => (
              <div key={index} style={{ animationDelay: `${index * 0.07}s` }}>
                <ReactCardFlip isFlipped={state.faces[index]} flipDirection="horizontal">
                  <Card value="card-back" image="blue-card-back.png" />
                  <Card value={card.code} image={card.image} />
                </ReactCardFlip>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pyramid Phase */}
      {gameState === 'pyramid' && (
        <div className="flex flex-col items-center gap-3 my-4 animate-fade-in w-full">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}
          >
            Pyramid Phase
          </div>
          <p className="text-sm" style={{ color: 'var(--white-dim)' }}>
            Match a card → assign sips! Match a suit → redirect! Golden card → shield!
          </p>

          {pyramidCountdown !== null && (
            <div
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                fontWeight: 900,
                fontFamily: 'serif',
                lineHeight: 1,
                color: pyramidCountdown <= 3 ? 'var(--red)' : 'var(--gold)',
                textShadow: pyramidCountdown <= 3
                  ? '0 0 20px rgba(224,64,58,0.6)'
                  : '0 0 20px rgba(232,184,75,0.5)',
                transition: 'color 0.3s, text-shadow 0.3s',
              }}
            >
              {pyramidCountdown}
            </div>
          )}

          {state.pyramidCards.length === 0 && (
            <p className="text-sm animate-pulse" style={{ color: 'var(--white-dim)' }}>
              Building pyramid from players' hands…
            </p>
          )}

          {state.pyramidCards.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              {pyramidRows.map(({ indices, sips }, rowIdx) => (
                <div key={rowIdx} className="flex flex-col items-center gap-1">
                  <div className="text-xs font-semibold mb-1" style={{ color: sipColor(sips) }}>
                    {sips} sip{sips > 1 ? 's' : ''}
                  </div>
                  <div className="flex flex-row gap-2 justify-center">
                    {indices.map(i => {
                      const isActive = i === state.pyramidIndex;
                      const isRevealed = i < state.pyramidIndex;
                      const card = state.pyramidCards[i];
                      return (
                        <div
                          key={i}
                          style={{
                            transition: 'box-shadow 0.3s',
                            boxShadow: isActive
                              ? '0 0 20px 4px rgba(232, 184, 75, 0.6)'
                              : 'none',
                            borderRadius: 6,
                            outline: (isActive || isRevealed) && card?.golden
                              ? '2px solid var(--gold)'
                              : 'none',
                          }}
                        >
                          <ReactCardFlip isFlipped={isActive || isRevealed} flipDirection="horizontal">
                            <Card value="card-back" image="blue-card-back.png" />
                            <Card value={card?.code} image={card?.image} />
                          </ReactCardFlip>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sip tracker */}
          {playerNames.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {playerNames.map(p => (
                <div
                  key={p}
                  className="rounded-xl px-4 py-2 text-sm text-center"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    minWidth: 80,
                  }}
                >
                  <div style={{ color: 'var(--gold)', fontWeight: 700 }}>{p}</div>
                  <div style={{ color: 'var(--green)', fontSize: '0.75rem' }}>
                    {(state.players[p].hand || []).length} 🃏
                  </div>
                  <div style={{ color: 'var(--red)', fontSize: '0.75rem' }}>
                    {state.players[p].sips || 0} 💧
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timer */}
      {!shuffling && state.timer >= 0 && gameState !== 'end' && gameState !== 'pyramid' && (
        <Timer
          setTimer={setTimer}
          isActive={true}
          handleRound={handleRound}
          state={state}
        />
      )}

      {/* Cards remaining */}
      {state.status === 'reveal' && gameState !== 'pyramid' && (
        <div
          className="rounded-full px-4 py-1 text-xs font-medium tracking-wide mb-2"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'var(--white-dim)',
          }}
        >
          {state.deck.remaining} cards remaining
        </div>
      )}

      {/* Message */}
      {gameState !== 'pyramid' && gameState !== 'end' && (
        <div className="min-h-[60px] flex items-center justify-center w-full">
          {(state.status === 'reveal' ||
            (state.gameState !== 'end' && state.status === 'none' && state.timer >= -1)) && (
            <Message state={state} />
          )}
        </div>
      )}

    </div>
  );
}
