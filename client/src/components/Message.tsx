import React from "react"

type Props={
  status: any,
}

export default function Message({ status }:Props) {
  return (
    <div id='message-box'>
      {status === 'correct' && <h1>You guessed right! Move onto the next round.</h1>}
      {status === 'incorrect' && <h1>You guessed wrong! Take a shot and restart.</h1>}
      {status === 1 && <h1>Guess if the first card has a red suit or black suit...</h1>}
      {status === 2 && <h1>Guess if the second card is higher or lower than the first card...</h1>}
      {status === 3 && <h1>Guess if the third card is between or outside the first two cards...</h1>}
      {status === 4 && <h1>Guess the suit of the fourth card...</h1>}
    </div>
  )
}