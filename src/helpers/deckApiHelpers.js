import axios from "axios";

const updateDeck = (action) => {
  if (action === 'new') {
    return axios
      .get('https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then(data => {
        console.log("data", data.data)
        return data.data;
      })
      .catch(err => {
        console.log("Error loading: ", err);
      })
  }
  if (action === 'draw') {
    return axios
      .get('https://www.deckofcardsapi.com/api/deck/<<deck_id>>/draw/?count=2')
      .then(data => {
        return data.data;
      })
      .catch(err => {
        console.log("Error loading: ", err);
      })
  }
}

export default updateDeck