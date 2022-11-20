import React from "react";
import Button from "./Button"

type Props = {
  state: any,
  handleOptions: any,
  handleSelection: any,
  player: string,
}

export default function Controls({state,player,handleOptions, handleSelection}:Props) {
  const option1 = handleOptions()[0];
  const option2 = handleOptions()[1];
  const option3 = handleOptions()[2];
  const option4 = handleOptions()[3];
  return(
    <>
    {state.card[0] && <div className='flex flex-row justify-center'>
      <Button option={option1} handleSelection={handleSelection} status={state.status} player={player}/>
      <Button option={option2} handleSelection={handleSelection} status={state.status} player={player}/>
      {state.round===4 && <Button option={option3} handleSelection={handleSelection} status={state.status} player={player} />}
      {state.round===4 && <Button option={option4} handleSelection={handleSelection} status={state.status} player={player} />}
      </div>}
    </>
  )
}