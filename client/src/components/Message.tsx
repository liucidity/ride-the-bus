import { statSync } from "fs"
import React from "react"

type Props={
  state: any,
}

export default function Message({ state }:Props) {

  const playerGuesses = Object.keys(state.players).map((player) => {
    return {player, choice: state.players[player].choice}
  })

  return (
    <div id='message-box'>
      {state.status === 'reveal' && playerGuesses.map((player) => <h6>{player.player} picked: {player.choice}</h6>)}
      {state.gameState === 'end' && <h1>{state.winner} has won! 🏆</h1>}
      {state.status === 'none' && state.round === 1 && <h1>Guess if the first card has a red suit or black suit...</h1>}
      {state.status === 'none' && state.round === 2 && <h1>Guess if the second card is higher or lower than the first card...</h1>}
      {state.status === 'none' && state.round === 3 && <h1>Guess if the third card is between or outside the first two cards...</h1>}
      {state.status === 'none' && state.round === 4 && <h1>Guess the suit of the fourth card...</h1>}
    </div>
  )
}