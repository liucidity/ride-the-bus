import React, { useEffect, useState, useRef } from 'react';
import Timer from './Timer';
import Message from './Message';
import Card from './Card';
import ReactCardFlip from 'react-card-flip';
import { io, Socket } from 'socket.io-client';
import { usePartyApplicationData } from '../helpers/usePartyApplicationData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title:  { display: false },
  },
  scales: {
    x: {
      max: 10,
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { color: 'rgba(248, 240, 227, 0.70)', font: { size: 14 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { color: 'rgba(248, 240, 227, 0.70)', font: { size: 14 } },
    },
  },
  indexAxis: 'y' as const,
  maintainAspectRatio: false,
};

const BAR_COLORS = ['#2dba6e', '#e8b84b', '#e0403a', '#7c9fff'];

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
  } = usePartyApplicationData();

  const [initialState, setInitialState] = useState({});
  const gameState = state.gameState;
  const socketRef = useRef<Socket>();

  const startGame = async () => {
    if (gameState !== 'end') {
      setInitialState({ ...state });
    } else {
      resetState(initialState);
      updateDeck('reshuffle');
    }
    await updateDeck('draw');
    startGameStatus();
    setTimer(10);
  };

  useEffect(() => {
    socketRef.current = io('https://ride-the-bus-socket.onrender.com', {
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

    return () => {
      socketRef.current!.off('connect');
      socketRef.current!.off('disconnect');
      socketRef.current!.off('buttonPress');
      socketRef.current!.disconnect();
    };
  }, []);

  useEffect(() => {
    socketRef.current?.emit('round', state.round);
  }, [state.round]);

  const playerNames = Object.keys(state.players);
  const chartData = {
    labels: playerNames,
    datasets: [
      {
        label: 'Points',
        data: playerNames.map((p) => state.players[p].points),
        backgroundColor: playerNames.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
        barThickness: 20,
        maxBarThickness: 22,
        minBarLength: 6,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-10 min-h-screen">

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

      {/* Lobby */}
      {gameState !== 'running' && (
        <div className="flex flex-col items-center gap-4 w-full max-w-md animate-fade-in">
          {playerNames.length > 0 && (
            <>
              <p
                className="font-display italic text-base"
                style={{ color: 'var(--white-dim)' }}
              >
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
            {gameState === 'end' ? 'Play Again' : 'Start Game'}
          </button>
        </div>
      )}

      {/* Cards */}
      {gameState === 'running' && (
        <div className="flex flex-row flex-wrap justify-center gap-2 sm:gap-3 my-6 animate-scale-in">
          {state.card.map((card: any, index: number) => (
            <div key={index} style={{ animationDelay: `${index * 0.07}s` }}>
              <ReactCardFlip isFlipped={state.faces[index]} flipDirection="horizontal">
                <Card value="card-back" image="blue-card-back.png" />
                <Card value={card.code} image={card.image} />
              </ReactCardFlip>
            </div>
          ))}
        </div>
      )}

      {/* Timer */}
      {state.timer >= 0 && gameState !== 'end' && (
        <Timer
          setTimer={setTimer}
          isActive={true}
          handleRound={handleRound}
          state={state}
        />
      )}

      {/* Cards remaining */}
      {state.status === 'reveal' && (
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
      <div className="min-h-[60px] flex items-center justify-center w-full">
        {(state.status === 'reveal' ||
          state.gameState === 'end' ||
          (state.gameState !== 'end' && state.status === 'none' && state.timer > 0)) && (
          <Message state={state} />
        )}
      </div>

      {/* Score chart */}
      {gameState === 'running' && playerNames.length > 0 && (
        <div id="bar-chart" style={{ height: `${Math.max(160, playerNames.length * 44)}px` }}>
          <Bar options={chartOptions} data={chartData} />
        </div>
      )}
    </div>
  );
}
