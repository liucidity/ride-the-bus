import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"
import PartyButton from "./PartyButton"

type Props = {
  state: any,
  handleSelection: any,
  handleOptions: any,
  player: string
}

const socket = io('http://localhost:3001')    
export default function PartyControls({state,handleSelection, player}:Props) {
  const [round, setRound] = useState(1)


  useEffect(() => {
    socket.on('connect', ()=> console.log(socket.id))
    socket.on('connect_error', ()=>{
      setTimeout(()=>socket.connect()
      ,5000)
    })   
    
    socket.on('round',(round)=> {
       setRound(round)
    })
    return ()=>{
      socket.disconnect()
    }

    
  }, [])

  const handleOptions = () => {
    switch (round) {
      case 1:
        return ["Red", "Black"];
      case 2:
        return ["Higher", "Lower"];
      case 3:
        return ["Inside", "Outside"];
      case 4:
        return ["Diamond", "Club", "Heart", "Spade"];
      default:
        return ["error", "error"];
    }
  };

  const option1 = handleOptions()[0];
  const option2 = handleOptions()[1];
  const option3 = handleOptions()[2];
  const option4 = handleOptions()[3];
  
  const sendPress = (player,choice) => {
    socket.emit("buttonPress",player,choice)
  }

  return(
    <>
    {<div className='flex flex-row justify-center'>
      <PartyButton option={option1} handleSelection={handleSelection} status={state.status} sendPress={sendPress} player={player}/>
      <PartyButton option={option2} handleSelection={handleSelection} status={state.status} sendPress={sendPress} player={player}/>
      {round===4 && <PartyButton option={option3} handleSelection={handleSelection} status={state.status} sendPress={sendPress} player={player}/>}
      {round===4 && <PartyButton option={option4} handleSelection={handleSelection} status={state.status} sendPress={sendPress} player={player}/>}
      </div>}
    </>
  )
}