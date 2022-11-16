import axios from "axios";
import { useReducer, useState } from "react";

export const useApplicationData = () => {

  const NEW_DECK = 'NEW_DECK';
  const DRAW = "DRAW";

  const reducer = (state, action) => {
    const reducers = {
      NEW_DECK: state => ({...state, deck: action.deck}),
      DRAW: state => ({...state, card: action.card}),
    }
    return reducers[action.type](state) || reducers.default();
  }

  const [state, dispatch] = useReducer(reducer, {
    deck: {},
    card: {}
  })


  const updateDeck = (action) => {
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
    state
  }
}
