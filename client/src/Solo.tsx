import './index.css';
import { useApplicationData } from './helpers/useApplicationData';
import Button from './components/Button';
import { useEffect, useState } from 'react';
import { callbackify } from 'util';
import {io} from 'socket.io-client'
import Game from './components/Game';
import Controls from './components/Controls'


function Solo() {
  const {
        state,
        updateDeck,
        handleGuess,
        handleOptions,
      } = useApplicationData();

  

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
      <Game state={state} updateDeck={updateDeck} />
      <Controls state={state} handleGuess={handleGuess} handleOptions={handleOptions} />
    </div>

      
  );
}


export default Solo;
