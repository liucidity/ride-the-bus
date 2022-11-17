import './index.css';
import { useApplicationData } from './helpers/useApplicationData';
import Button from './components/Button';
import Timer from './components/Timer';
import Message from './components/Message';
import Card from './components/Card';
import ReactCardFlip from 'react-card-flip';
import { useEffect } from 'react';


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

  useEffect(() => {
    updateDeck('new')
  }, [])

  return (
    <div className="flex flex-col items-center py-10">
      <div className="App">
       {/* <div>
         {state.deck && state.deck.deck_id}
         <button onClick={() => {
           updateDeck('new')
           gameRound('reset')
           }}>New Deck</button>
       </div> */}
       <div>
       </div>
     </div>
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
      <div className='h-20'>

      {state.status === "correct" && <Message status={"correct"} />}
      {state.status === "incorrect" && <Message status={"incorrect"} />}
      </div>
      
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
