import './index.css';
import { usePartyApplicationData } from './helpers/usePartyApplicationData';
import Button from './components/Button';
import { useEffect, useState } from 'react';
import { callbackify } from 'util';
import {io} from 'socket.io-client'
import PartyGame from './components/PartyGame';
import Controls from './components/Controls'
import React from 'react';


function Party() {
  const {
        state,
        updateDeck,
        handleRound,
        handleOptions,
        handleSelection,
        setTimer,
      } = usePartyApplicationData();

  

  // const [time, setTime] = useState('fetching') 
  

  useEffect(() => {
    // const socket = io('http://localhost:3001')    
    // socket.on('connect', ()=>console.log(socket.id))
    // socket.on('connect_error', ()=>{
    //   setTimeout(()=>socket.connect()
    //   ,5000)
    // })   
    // socket.on('time', (data)=>setTime(data))
    // socket.on('disconnect',()=>setTime('server disconnected'))
    updateDeck('new')
  }, [])

  return (
    <div>
      <PartyGame state={state} updateDeck={updateDeck} handleRound={handleRound} setTimer={setTimer}/>
      <Controls state={state} handleOptions={handleOptions} handleSelection={handleSelection} player={'blue'} />
      <Controls state={state} handleOptions={handleOptions} handleSelection={handleSelection} player={'red'} />
    </div>

      
  );
}


export default Party;
