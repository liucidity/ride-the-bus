import axios from "axios";
import { useReducer } from "react";

export const usePartyApplicationData = () => {
  const NEW_DECK = "NEW_DECK";
  const DRAW = "DRAW";
  const RESHUFFLE = "RESHUFFLE";
  const ROUND = "ROUND";
  const EMPTY_FACES = "EMPTY_FACES";
  const ADD_FACES = "ADD_FACES";
  const STATUS = "STATUS";
  const SELECTION = "SELECTION";
  const SET_TIMER = 'SET_TIMER';
  const ADD_SIPS = 'ADD_SIPS';
  const ADD_TO_HAND = 'ADD_TO_HAND';
  const CREATE_PLAYER = 'CREATE_PLAYER';
  const DISCONNECT_PLAYER = "DISCONNECT_PLAYER";
  const SET_ROOM_ID = 'SET_ROOM_ID';
  const SET_GAME_STATE = 'SET_GAME_STATE';
  const RESET_STATE = 'RESET_STATE';
  const SET_PYRAMID_CARDS = 'SET_PYRAMID_CARDS';
  const PYRAMID_NEXT = 'PYRAMID_NEXT';
  const FINISH_PYRAMID = 'FINISH_PYRAMID';
  const SET_LAP = 'SET_LAP';
  const REMOVE_FROM_HAND = 'REMOVE_FROM_HAND';
  const SET_DRINKING_BUDDY = 'SET_DRINKING_BUDDY';

  const reducer = (state, action) => {
    const reducers = {
      ROUND: (state) => ({ ...state, round: action.round }),
      SET_LAP: (state) => ({ ...state, lap: action.lap }),
      NEW_DECK: (state) => ({ ...state, deck: action.deck }),
      DRAW: (state) => ({
        ...state,
        card: action.card,
        deck: { ...state.deck, remaining: action.remaining },
      }),
      RESHUFFLE: (state) => ({
        ...state,
        deck: { ...state.deck, remaining: action.remaining },
      }),
      EMPTY_FACES: (state) => ({ ...state, faces: action.faces }),
      ADD_FACES: (state) => ({
        ...state,
        faces: [...state.faces, action.faces],
      }),
      STATUS: (state) => ({ ...state, status: action.status }),
      SELECTION: (state) => ({
        ...state,
        players: {
          ...state.players,
          [action.player]: { ...state.players[action.player], choice: action.selection },
        },
      }),
      SET_TIMER: (state) => ({ ...state, timer: action.timer }),
      ADD_SIPS: (state) => ({
        ...state,
        players: {
          ...state.players,
          [action.player]: {
            ...state.players[action.player],
            sips: (state.players[action.player]?.sips || 0) + action.amount
          }
        }
      }),
      ADD_TO_HAND: (state) => ({
        ...state,
        players: {
          ...state.players,
          [action.player]: { ...state.players[action.player], hand: action.hand }
        }
      }),
      CREATE_PLAYER: (state) => ({
        ...state,
        players: {
          ...state.players,
          [action.username]: action.player
        }
      }),
      DISCONNECT_PLAYER: (state) => ({
        ...state,
        players: Object.fromEntries(
          Object.entries(state.players).filter(([, p]) => p.id !== action.socketId)
        ),
      }),
      SET_ROOM_ID: (state) => ({ ...state, room: action.id }),
      SET_GAME_STATE: (state) => ({
        ...state,
        gameState: action.gameState,
        winner: action.winner || null
      }),
      RESET_STATE: () => action.state,
      SET_PYRAMID_CARDS: (state) => ({
        ...state,
        pyramidCards: action.cards,
        pyramidIndex: 0,
        pyramidSips: action.sips,
        gameState: 'pyramid',
      }),
      PYRAMID_NEXT: (state) => ({
        ...state,
        pyramidIndex: state.pyramidIndex + 1,
      }),
      REMOVE_FROM_HAND: (state) => {
        const hand = state.players[action.player]?.hand || [];
        const idx = hand.findIndex(c => c.code === action.cardCode);
        if (idx === -1) return state;
        const newHand = [...hand.slice(0, idx), ...hand.slice(idx + 1)];
        return {
          ...state,
          players: {
            ...state.players,
            [action.player]: { ...state.players[action.player], hand: newHand }
          }
        };
      },
      SET_DRINKING_BUDDY: (state) => {
        const buddies = { ...state.drinkingBuddies };
        buddies[action.player] = action.buddy;
        buddies[action.buddy] = action.player;
        return { ...state, drinkingBuddies: buddies };
      },
      FINISH_PYRAMID: (state) => ({
        ...state,
        round: 1,
        lap: 1,
        gameState: 'end',
        drinkingBuddies: {},
        winner: action.winner || null,
        players: Object.fromEntries(
          Object.entries(state.players).map(([name, p]) => [name, { ...p, hand: [] }])
        ),
      }),
    };
    return reducers[action.type](state);
  };

  const [state, dispatch] = useReducer(reducer, {
    round: 1,
    lap: 1,
    maxLaps: 3,
    faces: [],
    deck: {},
    card: {},
    status: 'none',
    players: {},
    timer: -1,
    gameState: 'paused',
    pyramidCards: [],
    pyramidIndex: -1,
    pyramidSips: [],
    drinkingBuddies: {},
  });

  const resetState = (state) => {
    dispatch({ type: RESET_STATE, state });
  };

  const createPlayer = (username, socketId) => {
    dispatch({
      type: CREATE_PLAYER,
      username,
      player: { id: socketId, choice: '', sips: 0, hand: [] }
    });
  };

  const disconnectPlayer = (socketId) => {
    dispatch({ type: DISCONNECT_PLAYER, socketId });
  };

  const gameRound = (action) => {
    if (action === "nextRound") {
      dispatch({ type: ROUND, round: (state.round += 1) });
    }
    if (action === "reset") {
      dispatch({ type: ROUND, round: 1 });
    }
  };

  const handleOptions = () => {
    switch (state.round) {
      case 1: return ["Red", "Black"];
      case 2: return ["Higher", "Lower"];
      case 3: return ["→←", "←→"];
      case 4: return ["Diamond", "Club", "Heart", "Spade"];
      default: return ["error", "error"];
    }
  };

  const handleFaces = (action) => {
    if (action === "empty") {
      dispatch({ type: EMPTY_FACES, faces: [] });
    }
    if (action === "add") {
      dispatch({ type: ADD_FACES, faces: true });
    }
  };

  const handleStatus = (action) => {
    if (action === "reveal") {
      dispatch({ type: STATUS, status: "reveal" });
      setTimeout(() => {
        dispatch({ type: STATUS, status: "none" });
      }, 4000);
    }
    if (action === "reset") {
      dispatch({ type: STATUS, status: "none" });
    }
    if (action === "end") {
      dispatch({ type: STATUS, status: "end" });
    }
  };

  const drawOrReshuffle = async () => {
    await updateDeck("draw");
  };

  const handleSelection = (player, choice) => {
    dispatch({ type: SELECTION, player, selection: choice });
  };

  const addSips = (player, amount) => {
    dispatch({ type: ADD_SIPS, player, amount });
  };

  // Stores full card object {value, suit, code, image, golden?}
  const addToHand = (player, card) => {
    state.players[player].hand.push(card);
    dispatch({
      type: ADD_TO_HAND,
      player,
      hand: [...state.players[player].hand]
    });
  };

  const removeFromHand = (player, cardCode) => {
    dispatch({ type: REMOVE_FROM_HAND, player, cardCode });
  };

  const addCardsToHand = (player, cards) => {
    cards.forEach(c => state.players[player].hand.push(c));
    dispatch({
      type: ADD_TO_HAND,
      player,
      hand: [...state.players[player].hand]
    });
  };

  const setDrinkingBuddy = (player, buddy) => {
    dispatch({ type: SET_DRINKING_BUDDY, player, buddy });
  };

  const isCorrectGuess = (round, choice, card) => {
    switch (round) {
      case 1:
        return (choice === "Red" && (card[0].suit === "HEARTS" || card[0].suit === "DIAMONDS")) ||
               (choice === "Black" && (card[0].suit === "CLUBS" || card[0].suit === "SPADES"));
      case 2:
        if (choice === "Higher" && card[1].value > card[0].value) return true;
        if (choice === "Lower" && card[1].value < card[0].value) return true;
        return false;
      case 3: {
        const high = Math.max(card[0].value, card[1].value);
        const low = Math.min(card[0].value, card[1].value);
        if (choice === "Inside" && card[2].value < high && card[2].value > low) return true;
        if (choice === "Outside" && (card[2].value > high || card[2].value < low)) return true;
        return false;
      }
      case 4:
        return (choice === "Diamond" && card[3].suit === "DIAMONDS") ||
               (choice === "Club" && card[3].suit === "CLUBS") ||
               (choice === "Heart" && card[3].suit === "HEARTS") ||
               (choice === "Spade" && card[3].suit === "SPADES");
      default:
        return false;
    }
  };

  const startGameStatus = () => {
    dispatch({ type: SET_GAME_STATE, gameState: "running" });
  };

  const pauseGameStatus = () => {
    dispatch({ type: SET_GAME_STATE, gameState: "paused" });
  };

  const handleRound = (players) => {
    const round = state.round;
    const lap = state.lap;
    const maxLaps = state.maxLaps;
    const card = state.card;
    handleFaces("add");
    handleStatus("reveal");

    for (let player in players) {
      const choice = players[player].choice;
      const correct = isCorrectGuess(round, choice, card);

      if (correct) {
        // Round 4 cards are golden — can be used as shields in pyramid phase
        const wonCard = { ...card[round - 1], golden: round === 4 };
        addToHand(player, wonCard);
      } else {
        addSips(player, 1);
      }
    }

    setTimeout(async () => {
      for (let player in players) handleSelection(player, '');
      if (round < 4) {
        gameRound('nextRound');
        setTimer(-1);
      } else if (lap < maxLaps) {
        state.lap += 1;
        dispatch({ type: SET_LAP, lap: state.lap });
        dispatch({ type: ROUND, round: (state.round = 1) });
        handleFaces('empty');
        await drawOrReshuffle();
        setTimer(-1);
      } else {
        enterPyramidPhase();
      }
    }, 4000);
  };

  // Compute sip values for a pyramid of n cards using triangular row layout.
  // Rows from bottom: row 1 = 1 sip, row 2 = 2 sips, ..., row k = k sips.
  // Returns array of length n where index i gets sip value of its row.
  const computePyramidSips = (n) => {
    // Find number of complete rows: largest k where k*(k+1)/2 <= n
    let k = 0;
    while ((k + 1) * (k + 2) / 2 <= n) k++;
    // Assign sips: bottom row (largest) = 1 sip, top row = k sips
    // Cards are ordered bottom-to-top: indices 0..(rowSize-1) = row 1, etc.
    const sips = [];
    for (let row = 1; row <= k; row++) {
      const rowSize = k - row + 1;
      for (let i = 0; i < rowSize; i++) {
        sips.push(row);
      }
    }
    // Fill any remainder with max sip value
    while (sips.length < n) sips.push(k);
    return sips;
  };

  const enterPyramidPhase = () => {
    dispatch({ type: SET_GAME_STATE, gameState: 'pyramid' });

    // Build pyramid deck from all cards in players' hands (duplicates allowed)
    const allCards = Object.values(state.players).flatMap(p => p.hand || []);

    if (allCards.length === 0) {
      // No cards earned — skip pyramid
      finishPyramidPhase();
      return;
    }

    // Fisher-Yates shuffle
    const shuffled = [...allCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Pyramid must be exactly 6 or 10 cards
    const targetCount = shuffled.length >= 10 ? 10 : 6;
    const pyramidCards = shuffled.slice(0, targetCount);
    const pyramidSips = computePyramidSips(targetCount);

    dispatch({
      type: SET_PYRAMID_CARDS,
      cards: pyramidCards,
      sips: pyramidSips,
    });
  };

  const pyramidFlipNext = () => {
    dispatch({ type: PYRAMID_NEXT });
  };

  const finishPyramidPhase = () => {
    handleFaces("empty");
    // Winner = player with fewest sips
    const players = state.players;
    const winner = Object.keys(players).reduce((best, player) => {
      if (!best) return player;
      return (players[player]?.sips || 0) < (players[best]?.sips || 0) ? player : best;
    }, null);
    dispatch({ type: FINISH_PYRAMID, winner });
  };

  const setTimer = (duration) => {
    dispatch({ type: SET_TIMER, timer: duration });
  };

  const updateDeck = (action) => {
    if (action === "new") {
      return axios
        .get("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
        .then((res) => {
          dispatch({ type: NEW_DECK, deck: res.data });
        })
        .catch((err) => console.log("Error loading: ", err));
    }
    if (action === "draw") {
      return axios
        .get(`https://www.deckofcardsapi.com/api/deck/${state.deck.deck_id}/draw/?count=4`)
        .then((res) => {
          res.data.cards.map((card) => {
            if (card.value === "ACE") card.value = "14";
            if (card.value === "KING") card.value = "13";
            if (card.value === "QUEEN") card.value = "12";
            if (card.value === "JACK") card.value = "11";
            return (card.value = parseInt(card.value));
          });
          dispatch({
            type: DRAW,
            card: res.data.cards,
            remaining: (state.deck.remaining = res.data.remaining),
          });
        })
        .catch((err) => console.log("Error loading: ", err));
    }
    if (action === "reshuffle") {
      return axios
        .get(`https://www.deckofcardsapi.com/api/deck/${state.deck.deck_id}/shuffle/`)
        .then((res) => {
          dispatch({ type: RESHUFFLE, remaining: res.data.remaining });
        })
        .catch((err) => console.log(err));
    }
  };

  const setRoomId = () => {
    dispatch({ type: SET_ROOM_ID, id: generateRandomID(4) });
  };

  const generateRandomID = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  return {
    updateDeck,
    state,
    gameRound,
    handleRound,
    handleOptions,
    handleStatus,
    handleSelection,
    setTimer,
    createPlayer,
    disconnectPlayer,
    setRoomId,
    startGameStatus,
    pauseGameStatus,
    resetState,
    addSips,
    addToHand,
    addCardsToHand,
    removeFromHand,
    setDrinkingBuddy,
    pyramidFlipNext,
    finishPyramidPhase,
    enterPyramidPhase,
  };
};
