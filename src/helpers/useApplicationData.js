import axios from "axios";
import { useReducer, useState } from "react";

export const useApplicationData = () => {

  const NEW_DECK = 'NEW_DECK';
  const DRAW = "DRAW";
  const ROUND = "ROUND"

  const reducer = (state, action) => {
    const reducers = {
      ROUND: state => ({ ...state, round: action.round }),
      NEW_DECK: state => ({ ...state, deck: action.deck }),
      DRAW: state => ({ ...state, card: action.card }),
    }
    return reducers[action.type](state) || reducers.default();
  }

  const [state, dispatch] = useReducer(reducer, {
    round: 1,
    deck: {},
    card: {}
  })
  const gameRound = (action) => {
    if (action === 'nextRound') {
      dispatch({
        type: ROUND,
        round: state.round += 1,
      })
    }
    if (action === 'reset') {
      dispatch({
        type: ROUND,
        round: 1,
      })
    }
  }

  const handleOptions = () => {
    switch (state.round) {
      case 1:
        return ["Red", "Black"]
      case 2:
        return ["Higher", "Lower"]
      case 3:
        return ["Inside", "Outside"]
      case 4:
        return ["Diamond", "Club", "Heart", "Spade"]
      default:
        return ['error', 'error']
    }
  }

  const handleGuess = (choice) => {
    switch (state.round) {
      case 1:
        if (choice === 'Red' && (state.card.code.includes("H") || state.card.code.includes("D"))) {
          console.log(state.round)
          console.log(choice)
          console.log(state.card.code)
          gameRound('nextRound')
        } else if (choice === 'Black' && (state.card.code.includes("C") || state.card.code.includes("S"))) {
          console.log(state.round)
          console.log(choice)
          console.log(state.card.code)
          gameRound('nextRound')
        } else {
          updateDeck('new')
          gameRound('reset')
        }
        break;
      case 2:
        if (choice === "Higher") {

        }
        break;
      case 3:
        break;
      default:
    }
  }


  const updateDeck = (action) => {
    console.log(action)
    console.log(state)
    if (action === 'new') {
      return axios
        .get('https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
        .then(res => {
          dispatch({
            type: NEW_DECK,
            deck: res.data,
          })
        })
        .catch(err => {
          console.log("Error loading: ", err);
        })
    }
    if (action === 'draw') {
      return axios
        .get(`https://www.deckofcardsapi.com/api/deck/${state.deck.deck_id}/draw/?count=1`)
        .then(res => {
          console.log(res.data.cards)
          dispatch({
            type: DRAW,
            card: res.data.cards[0],
          })
        })
        .catch(err => {
          console.log("Error loading: ", err);
        })
    }
  }

  return {
    updateDeck,
    state,
    gameRound,
    handleGuess,
    handleOptions
  }
}
