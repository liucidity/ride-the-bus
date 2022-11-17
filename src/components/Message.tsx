type Props={
  status: string,
}

export default function Message({ status }:Props) {
  return (
    <div id='message-box'>
      {status === 'correct' && <h1>You guessed right! Move onto the next round.</h1>}
      {status === 'incorrect' && <h1>You guessed wrong! Take a shot and restart.</h1>}
    </div>
  )
}