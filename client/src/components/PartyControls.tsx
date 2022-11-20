import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import PartyButton from "./PartyButton"

type Props = {
  state: any,
  handleSelection: any,
  handleOptions: any,
  player: string
}

const socket = io('http://localhost:3001')    
export default function PartyControls({state,handleSelection,handleOptions, player}:Props) {
  useEffect(() => {
    socket.on('connect', ()=> console.log(socket.id))
    socket.on('connect_error', ()=>{
      setTimeout(()=>socket.connect()
      ,5000)
    })   
    return ()=>{
      socket.disconnect()
    }

    
  }, [])
  
  const sendPress = (player,choice) => {
    socket.emit("buttonPress",player,choice)
  }
  const option1 = handleOptions()[0];
  const option2 = handleOptions()[1];
  const option3 = handleOptions()[2];
  const option4 = handleOptions()[3];
  return(
    <>

    {<div className='flex flex-row justify-center'>
      <PartyButton option={option1} handleSelection={handleSelection} status={state.status} sendPress={sendPress} player={player}/>
      <PartyButton option={option2} handleSelection={handleSelection} status={state.status} sendPress={sendPress} player={player}/>
      {state.round===4 && <PartyButton option={option3} handleSelection={handleSelection} status={state.status} sendPress={sendPress} player={player}/>}
      {state.round===4 && <PartyButton option={option4} handleSelection={handleSelection} status={state.status} sendPress={sendPress} player={player}/>}
      </div>}
    </>
  )
}