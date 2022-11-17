import axios from "axios";
import { useReducer, useState } from "react";

export const useApplicationData = () => {

  const NEW_DECK = 'NEW_DECK';
  const DRAW = "DRAW";
  const ROUND = "ROUND";
  const FACES = "FACES";

  const reducer = (state, action) => {
    const reducers = {
      ROUND: state => ({ ...state, round: action.round }),
      NEW_DECK: state => ({ ...state, deck: action.deck }),
      DRAW: state => ({ ...state, card: action.card }),
      FACES: state => ({ ...state, faces: action.faces})
    }
    return reducers[action.type](state) || reducers.default();
  }

  const [state, dispatch] = useReducer(reducer, {
    round: 1,
    faces: [],
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

  const resetFaces = () => {
    dispatch({
      type: FACES,
      faces: [],
    })
    console.log('tried to reset faces...', state.faces)
  }

  const handleGuess = (choice) => {
    console.log('state after button press', state);
    let round = state.round
    let card = state.card
    let faces = state.faces
    switch (round) {
      case 1:
        if (choice === 'Red' && (card[0].suit === "HEARTS" || card[0].suit === "DIAMONDS")) {
          console.log(round)
          console.log(choice)
          console.log(card[0].code)
          faces[round - 1] = true
          gameRound('nextRound')
        } else if (choice === 'Black' && (card[0].suit === "CLUBS" || card[0].suit === "SPADES")) {
          console.log(round)
          console.log(choice)
          console.log(card[0].code)
          faces[round - 1] = true
          gameRound('nextRound')
        } else {
          faces[round - 1] = true
          setTimeout(() => {
            resetFaces()
            updateDeck('new')
            updateDeck('draw')
            gameRound('reset')
          }, 5000);
        }
        break;
      case 2:
        if (choice === "Higher" && (card[1].code[0] > card[0].code[0])) {
          console.log(round)
          console.log(choice)
          console.log(card[1].code)
          faces[round - 1] = true
          gameRound('nextRound')
        }
        else if (choice === 'Lower' && (card[1].code[0] < card[0].code[0])) {
          console.log(round)
          console.log(choice)
          console.log(card[1].code)
          faces[round - 1] = true
          gameRound('nextRound')
        } else {
          faces[round - 1] = true
          setTimeout(() => {
            resetFaces()
            updateDeck('new')
            updateDeck('draw')
            gameRound('reset')
          }, 5000);
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
        .get(`https://www.deckofcardsapi.com/api/deck/${state.deck.deck_id}/draw/?count=4`)
        .then(res => {
          console.log(res.data.cards)
          dispatch({
            type: DRAW,
            card: res.data.cards,
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
