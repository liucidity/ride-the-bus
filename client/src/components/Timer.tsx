import React, { useEffect } from 'react';

type Props = {
  isActive: boolean;
  handleRound: any;
  state: any;
  setTimer: any;
};

export default function Timer({ isActive, handleRound, state, setTimer }: Props) {
  const duration = state.timer;
  const danger = duration <= 3;

  useEffect(() => {
    const timer = duration > 0 && setInterval(() => setTimer(duration - 1), 1000);
    if (duration === 0) {
      handleRound(state.players);
    }
    return () => clearInterval(timer as any);
  }, [duration]);

  if (!isActive || duration <= 0) return <div className="h-20" />;

  return (
    <div className="h-20 flex items-center justify-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center font-display font-black text-2xl transition-all duration-300"
        style={{
          background: danger
            ? 'rgba(224, 64, 58, 0.15)'
            : 'rgba(45, 186, 110, 0.12)',
          border: `2px solid ${danger ? 'var(--red)' : 'var(--green)'}`,
          color: danger ? 'var(--red)' : 'var(--white)',
          boxShadow: danger
            ? '0 0 24px rgba(224, 64, 58, 0.30)'
            : '0 0 20px rgba(45, 186, 110, 0.22)',
          animation: danger ? 'timer-danger 0.6s ease-in-out infinite' : 'none',
        }}
      >
        {duration}
      </div>
    </div>
  );
}
