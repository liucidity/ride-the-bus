import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import Button from "./Button"

type Props = {
  state: any,
  handleGuess: any,
  handleOptions: any
}

const socket = io('http://localhost:3001')    
export default function PartyControls({state,handleGuess,handleOptions}:Props) {
  const [time, setTime] = useState('fetching') 
  useEffect(() => {
    socket.on('connect', ()=> console.log(socket.id))
    socket.on('connect_error', ()=>{
      setTimeout(()=>socket.connect()
      ,5000)
    })   
    socket.on('time', (data)=>setTime(data))
    socket.on('disconnect',()=>setTime('server disconnected'))
    return ()=>{
      socket.disconnect()
    }

    
  }, [])
  
  const sendPress = (button) => {
    socket.emit(button)
  }
  const option1 = handleOptions()[0];
  const option2 = handleOptions()[1];
  const option3 = handleOptions()[2];
  const option4 = handleOptions()[3];
  return(
    <>
    <button onClick={(e)=>sendPress(option1)}>
      yooo
    </button>
    {<div className='flex flex-row justify-center'>
      <Button option={option1} handleGuess={handleGuess} status={state.status} sendPress={sendPress}/>
      <Button option={option2} handleGuess={handleGuess} status={state.status} sendPress={sendPress}/>
      {state.round===4 && <Button option={option3} handleGuess={handleGuess} status={state.status} sendPress={sendPress}/>}
      {state.round===4 && <Button option={option4} handleGuess={handleGuess} status={state.status} sendPress={sendPress}/>}
      </div>}
    </>
  )
}