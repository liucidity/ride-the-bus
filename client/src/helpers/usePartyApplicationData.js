import axios from "axios";
import { defaultMaxListeners } from "events";
import { useReducer, useState } from "react";
import compareCardSuits from './suits'

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
  const ADD_POINT = 'ADD_POINT';

  const reducer = (state, action) => {
    const reducers = {
      ROUND: (state) => ({ ...state, round: action.round }),
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
      SET_TIMER: (state) => ({
        ...state,
        timer: action.timer
      }),
      ADD_POINT: (state) => ({
        ...state,
        players: {
          ...state.players,
          [action.player]: { ...state.players[action.player], points: action.points }
        }
      })
    };
    return reducers[action.type](state) || reducers.default();
  };

  const [state, dispatch] = useReducer(reducer, {
    round: 1,
    faces: [],
    deck: {},
    card: {},
    status: "none",
    players: { blue: { points: 0 }, red: { points: 0 } },
    timer: -1,
  });

  const gameRound = (action) => {
    if (action === "nextRound") {
      dispatch({
        type: ROUND,
        round: (state.round += 1),
      });
    }
    if (action === "reset") {
      dispatch({
        type: ROUND,
        round: 1,
      });
    }
  };

  const handleOptions = () => {
    switch (state.round) {
      case 1:
        return ["Red", "Black"];
      case 2:
        return ["Higher", "Lower"];
      case 3:
        return ["Inside", "Outside"];
      case 4:
        return ["Diamond", "Club", "Heart", "Spade"];
      default:
        return ["error", "error"];
    }
  };

  const handleFaces = (action) => {
    if (action === "empty") {
      dispatch({
        type: EMPTY_FACES,
        faces: [],
      });
      console.log("tried to reset faces...", state.faces);
    }
    if (action === "add") {
      dispatch({
        type: ADD_FACES,
        faces: true,
      });
    }
  };

  const handleStatus = (action) => {
    if (action === "correct") {
      dispatch({
        type: STATUS,
        status: "correct",
      });
      setTimeout(() => {
        dispatch({
          type: STATUS,
          status: "none",
        });
      }, 4000);
    }
    if (action === "incorrect") {
      dispatch({
        type: STATUS,
        status: "incorrect",
      });
      setTimeout(() => {
        dispatch({
          type: STATUS,
          status: "none",
        });
      }, 4000);
    }
    if (action === "reset") {
      dispatch({
        type: STATUS,
        action: "none",
      });
    }
  };

  const drawOrReshuffle = async () => {
    console.log("drawOrReshuffling");
    if (state.deck.remaining < 1) {
      console.log("old deck", state.deck.deck_id);
      await updateDeck("reshuffle");
      await updateDeck("draw");
    } else {
      updateDeck("draw");
    }
  };

  const handleSelection = (player, choice) => {
    dispatch({
      type: SELECTION,
      player: player,
      selection: choice,
    });
    console.log("player and choice", state.players);
  };

  const addPoint = (player, amount) => {
    dispatch({
      type: ADD_POINT,
      player: player,
      points: state.players[player].points += amount
    })
  }


  const handleRound = (players) => {
    console.log('handleRound functioning running!')
    let round = state.round;
    let card = state.card;
    handleFaces("add");
    for (let player in players) {
      let choice = players[player].choice;
      switch (round) {
        case 1:
          if (
            choice === "Red" &&
            (card[0].suit === "HEARTS" || card[0].suit === "DIAMONDS")
          ) {
            handleStatus("correct");
            addPoint(player, 1)
          } else if (
            choice === "Black" &&
            (card[0].suit === "CLUBS" || card[0].suit === "SPADES")
          ) {
            handleStatus("correct");
            addPoint(player, 1)
          } else {
            handleStatus("incorrect");
          }
          break;
        case 2:
          if (choice === "Higher" && card[1].value > card[0].value) {
            handleStatus("correct");
            addPoint(player, 1)
          } else if (choice === "Lower" && card[1].value < card[0].value) {
            handleStatus("correct");
            addPoint(player, 1)
          } else if (choice === 'Higher' && card[1].value === card[0].value && compareCardSuits(card[1].code, card[0].code)) {
            handleStatus("correct");
            addPoint(player, 1)
          } else if (choice === 'Lower' && card[1].value === card[0].value && !compareCardSuits(card[1].code, card[0].code)) {
            handleStatus("correct");
            addPoint(player, 1)
          } else {
            handleStatus("incorrect");
          }
          break;
        case 3:
          let high = Math.max(card[0].value, card[1].value);
          let low = Math.min(card[0].value, card[1].value);
          if (
            choice === "Inside" &&
            card[2].value < high &&
            card[2].value > low
          ) {
            handleStatus("correct");
            addPoint(player, 1)
          } else if (
            choice === "Outside" &&
            (card[2].value > high || card[2].value < low)
          ) {
            handleStatus("correct");
            addPoint(player, 1)
          } else {
            handleStatus("incorrect");
          }
          break;
        case 4:
          if (choice === "Diamond" && card[3].suit === "DIAMONDS") {
            handleStatus("correct");
            addPoint(player, 3)
          } else if (choice === "Club" && card[3].suit === "CLUBS") {
            handleStatus("correct");
            addPoint(player, 3)
          } else if (choice === "Heart" && card[3].suit === "HEARTS") {
            handleStatus("correct");
            addPoint(player, 3)
          } else if (choice === "Spade" && card[3].suit === "SPADES") {
            handleStatus("correct");
            addPoint(player, 3)
          } else {
            handleStatus("incorrect");
          }
          break;
        default:

      }
    }
    setTimeout(() => {
      if (round < 4) {
        gameRound('nextRound')
        setTimer(10)
      } else {
        gameRound("reset");
        handleFaces("empty");
        drawOrReshuffle();
        setTimer(10)
      }
    }, 4000);
  };

  const setTimer = (duration) => {
    dispatch({
      type: SET_TIMER,
      timer: duration
    })
  }

  const updateDeck = (action) => {
    if (action === "new") {
      return axios
        .get(
          "https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
        )
        .then((res) => {
          console.log(action);
          console.log(state);
          dispatch({
            type: NEW_DECK,
            deck: res.data,
          });
        })
        .catch((err) => {
          console.log("Error loading: ", err);
        });
    }
    if (action === "draw") {
      return axios
        .get(
          `https://www.deckofcardsapi.com/api/deck/${state.deck.deck_id}/draw/?count=4`
        )
        .then((res) => {
          console.log(action);
          console.log(state);
          console.log(res.data.cards);
          console.log(res.data);

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
        .catch((err) => {
          console.log("Error loading: ", err);
        });
    }
    if (action === "reshuffle") {
      return axios
        .get(
          `https://www.deckofcardsapi.com/api/deck/${state.deck.deck_id}/shuffle/`
        )
        .then((res) => {
          console.log(action);
          console.log(state);
          console.log("reshuffle data", res.data);
          dispatch({
            type: RESHUFFLE,
            remaining: res.data.remaining,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return {
    updateDeck,
    state,
    gameRound,
    handleRound,
    handleOptions,
    handleStatus,
    handleSelection,
    setTimer
  };
};
