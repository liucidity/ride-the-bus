import Button from "./Button"

type Props = {
  state: any,
  handleGuess: any,
  handleOptions: any
}



export default function Controls({state,handleGuess,handleOptions}:Props) {
  const option1 = handleOptions()[0];
  const option2 = handleOptions()[1];
  const option3 = handleOptions()[2];
  const option4 = handleOptions()[3];
  return(
    <>
    {state.card[0] && <div className='flex flex-row justify-center'>
      <Button option={option1} handleGuess={handleGuess} status={state.status}/>
      <Button option={option2} handleGuess={handleGuess} status={state.status}/>
      {state.round===4 && <Button option={option3} handleGuess={handleGuess} status={state.status}/>}
      {state.round===4 && <Button option={option4} handleGuess={handleGuess} status={state.status}/>}
      </div>}
    </>
  )
}