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
        if (choice === "Higher" && ((card[1].value) > (card[0].value))) {
          console.log(round)
          console.log(choice)
          console.log((card[1].value), '>', (card[0].value))
          console.log((card[1].value) > (card[0].value))
          handleFaces('add')
          handleStatus('correct')
          gameRound('nextRound')
        }
        else if (choice === 'Lower' && ((card[1].value) < (card[0].value))) {
          console.log(round)
          console.log(choice)
          console.log((card[1].value), '>', (card[0].value))
          console.log((card[1].value) > (card[0].value))
          handleFaces('add')
          handleStatus('correct')
          gameRound('nextRound')
        } else {
          handleFaces('add')
          handleStatus('incorrect')
          console.log(round)
          console.log(choice)
          console.log((card[1].value), '>', (card[0].value))
          console.log((card[1].value) > (card[0].value))
          setTimeout(() => {
            handleFaces('empty')
            updateDeck('new')
            updateDeck('draw')
            gameRound('reset')
          }, 4000);
        }
        break;
      case 3:
        let high = Math.max(card[0].value, card[1].value)
        let low = Math.min(card[0].value, card[1].value)
        if (choice === "Inside" && (card[2].value < high && card[2].value > low)) {
          console.log(round)
          console.log(choice)
          console.log(card[2].value)
          console.log(high, low)
          handleFaces('add')
          handleStatus('correct')
          gameRound('nextRound')
        }
        else if (choice === 'Outside' && ((card[2].value) > high || (card[2].value) < low)) {
          console.log(round)
          console.log(choice)
          console.log(card[2].value)
          console.log(high, low)
          handleFaces('add')
          handleStatus('correct')
          gameRound('nextRound')
        } else {
          handleFaces('add')
          handleStatus('incorrect')
          console.log(round)
          console.log(choice)
          console.log(card[2].value)
          console.log(high, low)
          setTimeout(() => {
            handleFaces('empty')
            updateDeck('new')
            updateDeck('draw')
            gameRound('reset')
          }, 2000);
        }
        break;
      case 4:
        if (choice === 'Diamond' && (card[3].suit === "DIAMONDS")) {
          console.log(round)
          console.log(choice)
          console.log(card[3].code)
          handleFaces('add')
          handleStatus('correct')
          console.log('state after button press', state);
          gameRound('nextRound')
        } else if (choice === 'Club' && (card[3].suit === "CLUBS")) {
          console.log(round)
          console.log(choice)
          console.log(card[3].code)
          handleFaces('add')
          handleStatus('correct')
          console.log('state after button press', state);
          gameRound('nextRound')
        } else if (choice === 'Heart' && (card[3].suit === "HEARTS")) {
          console.log(round)
          console.log(choice)
          console.log(card[3].code)
          handleFaces('add')
          handleStatus('correct')
          console.log('state after button press', state);
          gameRound('nextRound')
        } else if (choice === 'Spade' && (card[3].suit === "SPADES")) {
          console.log(round)
          console.log(choice)
          console.log(card[3].code)
          handleFaces('add')
          handleStatus('correct')
          console.log('state after button press', state);
          gameRound('nextRound')
        }
        else {
          handleFaces('add')
          handleStatus('incorrect')
          setTimeout(() => {
            handleFaces('empty')
            updateDeck('new')
            updateDeck('draw')
            gameRound('reset')
          }, 2000);
        }
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
          res.data.cards.map((card) => {
            if (card.value === "ACE") card.value = "14"
            if (card.value === "KING") card.value = "13"
            if (card.value === "QUEEN") card.value = "12"
            if (card.value === "JACK") card.value = "11"
            return card.value = parseInt(card.value)
          })
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
