import './index.css';
import { useApplicationData } from './helpers/useApplicationData';
import Button from './components/Button';
import { useEffect, useState } from 'react';
import { callbackify } from 'util';
import {io} from 'socket.io-client'
import Game from './components/Game';


function App() {
  const {
        state,
        updateDeck,
        gameRound,
        handleGuess,
        handleOptions,
      } = useApplicationData();

  const option1 = handleOptions()[0];
  const option2 = handleOptions()[1];
  const option3 = handleOptions()[2];
  const option4 = handleOptions()[3];

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

    {state.card[0] && <div className='flex flex-row justify-center'>
      <Button option={option1} handleGuess={handleGuess} status={state.status}/>
      <Button option={option2} handleGuess={handleGuess} status={state.status}/>
      {state.round===4 && <Button option={option3} handleGuess={handleGuess} status={state.status}/>}
      {state.round===4 && <Button option={option4} handleGuess={handleGuess} status={state.status}/>}
      </div>}
    </div>

      
  );
}


export default App;
