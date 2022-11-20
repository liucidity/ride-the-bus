// import './index.css';

import Timer from './Timer';
import Message from './Message';
import Card from './Card';
import ReactCardFlip from 'react-card-flip';
import React, { useEffect, useState } from 'react';
// import { useEffect, useState } from 'react';
// import { callbackify } from 'util';
// import {io} from 'socket.io-client'

type Props = {
  state: any
  updateDeck: any
  handleRound: any
  setTimer: any
}


export default function PartyGame({state, updateDeck, handleRound, setTimer}:Props) {

  const startGame = () => {
    updateDeck('draw');
    setTimer(10)
  }

  const bluePoints = state.players.blue.points;
  const redPoints = state.players.red.points;

  return (
    <div className="flex flex-col items-center py-10">
   <h1 className="text-2xl font-bold text-white pt-10">
     Bus Riders
   </h1>
     {!state.card[0] && 
     <div className='pt-40'>
      <button className="bg-blue-500 rounded w-40 h-12 m-4 text-white shadow-lg hover:bg-blue-600" onClick={() => startGame()}>
        Start Game
      </button>
     </div>}
   <div className='flex flex-row pt-20'>
     {state.card[0] &&
     
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
   <div className='h-20'>
    Blue Player: {bluePoints}
   </div>
   <div className='h-20'>
    Red Player: {redPoints}
   </div>
 </div>
  )
}