import React from 'react';
import PartyControls from './components/PartyControls'
import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"
import PartyButton from "./components/PartyControls"
import PlayerCreate from "./components/PlayerCreate"



const socket = io('https://ride-the-bus-socket.onrender.com' , {
  withCredentials: true,
  extraHeaders: {
    "Access-Control-Allow-Origin": "abcd"
  }
})    
export default function PlayerClient() {
  
    const [round, setRound] = useState(1)
    const [username, setUsername] = useState('')
    const [playerReady, setPlayerReady] = useState(false)


  useEffect(() => {
    console.log('start')
    // socket.on('connect', ()=> console.log(socket.id))
    // socket.on('connection', (socket)=> socket.join('game-room'))
    socket.on('connect_error', ()=>{
      setTimeout(()=>socket.connect()
      ,5000)
    })   
    
    socket.on('round',(round)=> {
      console.log(round)
       setRound(round)
    })
    return ()=>{
      socket.disconnect()
    }

    
  }, [])

  
  const sendPress = (player:string,choice:string) => {
    console.log('pressed')
    console.log(player,choice)
    socket.emit("buttonPress",player,choice)
  }
  const setUser = (username:string) => {
    
    console.log(username)
    setUsername(username)
    setPlayerReady(true)

    socket.emit('enterRoom', {username})
  }


  return(
    <>
    {!playerReady && <PlayerCreate setUser={setUser} setUsername={setUsername} username={username} />}
    {playerReady && <PartyControls player={username} sendPress={sendPress} round={round}/>}
    {/* <PartyControls state={state} player={'blue'} handleOptions={handleOptions}/> */}
    {/* <PartyControls state={state} player={'red'} handleOptions={handleOptions}/> */}
    </>
  ) 
}





 