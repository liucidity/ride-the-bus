// import './index.css';
import { useApplicationData } from '../helpers/useSoloApplicationData';
import Timer from './Timer';
import SoloMessage from './SoloMessage';
import Card from './Card';
import ReactCardFlip from 'react-card-flip';
import React from 'react';
// import { useEffect, useState } from 'react';
// import { callbackify } from 'util';
// import {io} from 'socket.io-client'

type Props = {
  state: any
  updateDeck: any
}
export default function SoloGame({state, updateDeck}:Props) {
  return (
    <div className="flex flex-col items-center py-10">
   <h1 className="text-2xl font-bold text-white pt-10">
     Bus Riders
   </h1>
     {!state.card[0] && 
     <div className='pt-40'>
      <button className="bg-blue-500 rounded w-40 h-12 m-4 text-white shadow-lg hover:bg-blue-600" onClick={() => updateDeck('draw')}>
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
     {/* <Timer isActive={true} duration={20}/> */}
   </div>
   <div>
   {state.card[0] && <p className='h-10 text-3xl text-white'>

{state.deck.remaining} cards remaining
</p>}
   </div>
   <div className='h-20'>
   {state.status === "correct" && <SoloMessage status={"correct"} />}
   {state.status === "incorrect" && <SoloMessage status={"incorrect"} />}
   </div>
 </div>
  )
}