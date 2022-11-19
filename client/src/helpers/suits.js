const indexOfHigherSuit = (suits) => {
  if (suits[0] === "D") {
    return 1;
  }
  if (suits[0] === "C") {
    if (suits[1] === "D") {
      return 0
    }
    return 1
  }
  if (suits[0] === "H") {
    if (suits[1] === "C" || suits[1] === "D") {
      return 0
    }
    return 1
  }
  if (suits[0] === "S") {
    return 0
  }
}

const compareCardSuits = (card1, card2) => {
  const cards = [card1, card2]
  const suits = [card1.slice(1), card2.slice(1)]
  console.log(suits)
  return cards[indexOfHigherSuit(suits)]
};

export default compareCardSuits