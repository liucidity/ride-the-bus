const findAndDeletePlayer = (players, id) => {
  for (let player in players) {
    if (players[player].id === id) {
      delete players[player]
    }
  }
  return players
}

export default findAndDeletePlayer