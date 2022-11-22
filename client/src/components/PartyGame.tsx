// import './index.css';

import Timer from './Timer';
import Message from './Message';
import Card from './Card';
import ReactCardFlip from 'react-card-flip';
import React, { useEffect, useState, useRef} from 'react';
// import { useEffect, useState } from 'react';
// import { callbackify } from 'util';
import {io, Socket} from 'socket.io-client'


type Props = {
  state: any
  updateDeck: any
  handleRound: any
  setTimer: any
  handleSelection:any
  createPlayer:any
}


export default function PartyGame({state, updateDeck, handleRound, setTimer, handleSelection, createPlayer}:Props) {
  const [gameStarted, setGameStarted] = useState(false)

  const socketRef = useRef<Socket>();

  const startGame = async() => {
    
    await updateDeck('draw');
    setGameStarted(true)
    setTimer(10)
  }
  let socket;
  // let socket = io('http://localhost:3001')
  useEffect(() => {
    socketRef.current = io('http://localhost:3001' , {
      withCredentials: true,
      extraHeaders: {
        "controller": "abcd"
      }
    }) 
    updateDeck('new');
    socketRef.current.on('connect', ()=> console.log(socketRef.current.id))
    socketRef.current.on('connect_error', ()=>{
      setTimeout(()=>socketRef.current.connect()
      ,5000)
    })

    socketRef.current.on('setUser', (username, icon)=> {
      console.log(username,icon)
      createPlayer(username)
    })

    
    socketRef.current.on('buttonPress', (player,choice) => {
      console.log(player,choice)
      // update player state
      handleSelection(player,choice)
    });
    return ()=>{
      socketRef.current.off('connect')
      socketRef.current.off('disconnect')
      socketRef.current.off('buttonPress')
      socketRef.current.disconnect()
    }

    
  }, [])

  useEffect(()=> {
    console.log(state.round)
    sendRound(state.round)
  },[state.round])

  const sendRound=(round) => {
    // socket = io('http://localhost:3001')
    socketRef.current.emit("round",round)
  }


  // const bluePoints = state.players.blue.points;
  // const redPoints = state.players.red.points;

  return (
    <div className="flex flex-col items-center py-10">
   <h1 className="text-2xl font-bold text-white pt-10">
     Bus Riders
   </h1>
    
   {<div className="text-l font-bold text-white pt-10 pb-5"> 
      Connect to <a href='http://localhost:4000' target="_blank">
        http://localhost:4000
        </a> on your device
    </div>}
    {!gameStarted && <div className="text-2xl font-bold text-white pt-10 pb-5"> 
      Players:
    </div>}

    {!gameStarted && Object.keys(state.players).map((player:string)=> {
      return(
        <div className="text-l font-bold text-white">
          {player} ✅
          </div>
      )
    })}
     {!gameStarted && 
     <div className='pt-40'>
      <button className="bg-blue-500 rounded w-40 h-12 m-4 text-white shadow-lg hover:bg-blue-600" onClick={() => startGame()}>
        Start Game
      </button>
     </div>}
   <div className='flex flex-row pt-20'>
     {gameStarted &&
     
     state.card.map((card:any, index:number) => {
       return (
         <ReactCardFlip isFlipped={state.faces[index]} flipDirection="horizontal" >
           <Card value='card-back' image='blue-card-back.png'/>
           <Card value={card.code} image={card.image}/>
         </ReactCardFlip>
       )
     })}
   </div>

   <div>
    {state.timer >= 0 && <Timer setTimer={setTimer} isActive={true} handleRound={handleRound} state={state}/>}
   </div>
   <div>
   {(state.status === 'correct' || state.statue === 'incorrect') && <p className='h-10 text-3xl text-white'>

{state.deck.remaining} cards remaining
</p>}
   </div>
   <div className='h-20'>
   {state.status === "correct" && <Message status={"correct"} />}
   {state.status === "incorrect" && <Message status={"incorrect"} />}
   {state.status === "none" && state.timer > 0 && <Message status={state.round} />}
   </div>

   {gameStarted && Object.keys(state.players).map((player:any) => {
     return(
      <div className='h-20'>
      {player} Player: {state.players[player].points}
     </div>
     )
   })}

 </div>
  )
}