# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Ride The Bus** is a party card game web app with a 3-app monorepo:

- **client** (port 3000) — Host/display interface for the game (React + TypeScript)
- **player-client** (port 4000) — Mobile controller for players (React + TypeScript)
- **server** (port 3001) — WebSocket game server (Express + Socket.io)

Cards are sourced from the external [Deck of Cards API](https://www.deckofcardsapi.com/). No database; all game state is in-memory per session.

## Commands

Each app is run independently:

```bash
# Server
cd server && node express.js

# Client (host display)
cd client && npm start        # dev server
cd client && npm run build    # production build
cd client && npm test         # run tests

# Player client (mobile controller)
cd player-client && npm start
cd player-client && npm run build
cd player-client && npm test
```

## Architecture

### Game Flow

1. Players join via `player-client` by entering a username (sent as `enterRoom` socket event)
2. Host (client) draws 4 cards per round via the Deck of Cards API
3. Each round, players guess on the drawn card:
   - Round 1: Red or Black
   - Round 2: Higher or Lower
   - Round 3: Inside or Outside
   - Round 4: Which suit (worth 3 points)
4. First to 10 points wins

Game states: `paused`, `running`, `end`

### State Management

Both clients use a **custom hooks + useReducer** pattern:

- `client/src/helpers/usePartyApplicationData.js` — multiplayer state
- `client/src/helpers/useSoloApplicationData.js` — single-player state

Key reducer actions: `ROUND`, `DRAW`, `RESHUFFLE`, `NEW_DECK`, `STATUS`, `SELECTION`, `ADD_POINT`, `CREATE_PLAYER`, `DISCONNECT_PLAYER`

### Socket.io Events

All clients join `"mainRoom"`. Key events:

| Direction | Event | Purpose |
|-----------|-------|---------|
| player-client → server | `enterRoom` | Join with username |
| player-client → server | `buttonPress` | Submit a guess |
| server → client | `setUser` | New player joined |
| server → client | `round` | Current round number |
| server → client | `buttonPress` | Relay guess to host |
| server → client | `disconnectPlayer` | Player left |

### Key Files

- `server/express.js` — entire backend: socket setup, room management, event handlers
- `client/src/index.tsx` — routing (React Router); splits Party vs Solo modes
- `client/src/helpers/usePartyApplicationData.js` — multiplayer game logic hook
- `player-client/src/PlayerClient.tsx` — socket connection + player auth
- `player-client/src/components/PartyControls.tsx` — in-game button UI

### Styling

Tailwind CSS with custom theme values in each app's `tailwind.config.js`:
- `my_color`: `#4dcb7a` (green)
- `grey`: `#1f2937`
- `dark_slate`: `#0f172a`

### TypeScript Note

The `client` app is mixed: component files are `.tsx` but helpers in `client/src/helpers/` are plain `.js`.

### Deployment

Server allows CORS from both localhost ports and the production Render.com URLs:
- `https://ride-the-bus.onrender.com` (client)
- `https://ride-the-bus-player.onrender.com` (player-client)
