import axios from "axios";
import { useState } from "react";

export const useApplicationData = () => {

  const [deck, setDeck ] = useState()

  const updateDeck = (action) => {
    if (action === 'new') {
      return axios
      .get('https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then(res => {
        setDeck(res.data)
        console.log(res.data);
      })
      .catch(err => {
        console.log("Error loading: ", err);
      })
    }
    if (action === 'draw') {
      return axios
      .get(`https://www.deckofcardsapi.com/api/deck/${deck.deck_id}/draw/?count=1`)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        console.log("Error loading: ", err);
      })
    }
  }

  return {
    updateDeck,
    deck
  }
}
