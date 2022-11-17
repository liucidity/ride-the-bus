import axios from "axios";
import { defaultMaxListeners } from "events";
import { useReducer, useState } from "react";

export const useApplicationData = () => {

  const NEW_DECK = 'NEW_DECK';
  const DRAW = "DRAW";
  const ROUND = "ROUND";
  const EMPTY_FACES = "EMPTY_FACES";
  const ADD_FACES = "ADD_FACES";
  const STATUS = 'STATUS'

  const reducer = (state, action) => {
    const reducers = {
      ROUND: state => ({ ...state, round: action.round }),
      NEW_DECK: state => ({ ...state, deck: action.deck }),
      DRAW: state => ({ ...state, card: action.card }),
      EMPTY_FACES: state => ({ ...state, faces: action.faces}),
      ADD_FACES: state => ({ ...state, faces: [...state.faces, action.faces]}),
      STATUS: state => ({ ...state, status: action.status})
    }
    return reducers[action.type](state) || reducers.default();
  }

  const [state, dispatch] = useReducer(reducer, {
    round: 1,
    faces: [],
    deck: {},
    card: {},
    status: "none"
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

  const handleFaces = (action) => {
    if (action === 'empty') {
      dispatch({
        type: EMPTY_FACES,
        faces: [],
      })
      console.log('tried to reset faces...', state.faces)
    }
    if (action === 'add') {
      dispatch({
        type: ADD_FACES,
        faces: true,
      })
    }
  }

  const handleStatus = (action) => {
    if (action === 'correct') {
      dispatch({
        type: STATUS,
        status: 'correct',
      })
      setTimeout(() => {
        dispatch({
          type: STATUS,
          status: 'none',
        })
      }, 4000);
    }
    if (action === 'incorrect') {
      dispatch({
        type: STATUS,
        status: 'incorrect',
      })
      setTimeout(() => {
        dispatch({
          type: STATUS,
          status: 'none'
        })
      }, 4000);
    }
    if (action === 'reset') {
      dispatch({
        type: STATUS,
        action: 'none'
      })
    }
  }

  const handleGuess = (choice) => {
    let round = state.round
    let card = state.card
    switch (round) {
      case 1:
        if (choice === 'Red' && (card[0].suit === "HEARTS" || card[0].suit === "DIAMONDS")) {
          handleFaces('add')
          handleStatus('correct')
          gameRound('nextRound')
        } else if (choice === 'Black' && (card[0].suit === "CLUBS" || card[0].suit === "SPADES")) {
          handleFaces('add')
          handleStatus('correct')
          gameRound('nextRound')
        } else {
          handleFaces('add')
          handleStatus('incorrect')
          setTimeout(() => {
            handleFaces('empty')
            updateDeck('new')
            updateDeck('draw')
            gameRound('reset')
          }, 4000);
        }
        break;
      case 2:
        if (choice === "Higher" && (card[1].code[0] > card[0].code[0])) {
          handleFaces('add')
          handleStatus('correct')
          gameRound('nextRound')
        }
        else if (choice === 'Lower' && (card[1].code[0] < card[0].code[0])) {
          handleFaces('add')
          handleStatus('correct')
          gameRound('nextRound')
        } else {
          handleFaces('add')
          handleStatus('incorrect')
          setTimeout(() => {
            handleFaces('empty')
            updateDeck('new')
            updateDeck('draw')
            gameRound('reset')
          }, 4000);
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
    handleOptions,
    handleStatus
  }
}
