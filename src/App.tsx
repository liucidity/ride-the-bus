import './index.css';
import Button from './components/Button';
import Timer from './components/Timer';
import { useApplicationData } from './helpers/useApplicationData';
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
       <div>
         {state.deck && state.deck.deck_id}
         <button onClick={() => {
           updateDeck('new')
           gameRound('reset')
           }}>New Deck</button>
       </div>
       <div>
         {state.card && state.card.code}
         {state.card && <img alt='card' src={state.card.image}></img>}
         <button onClick={() => updateDeck('draw')}>Draw Card</button>
       </div>
     </div>
      <h1 className="text-2xl font-bold text-white">
        Bus Riders
      </h1>
      
      <div className='flex flex-row'>
        {state.card[0] &&
        
        state.card.map((card:any, index:number, isFlipped:boolean) => {
          return (
            <ReactCardFlip isFlipped={state.faces[index]} flipDirection="horizontal">
              <Card value='card-back' image='blue-card-back.png'/>
              <Card  value={card.code} image={card.image}/>
            </ReactCardFlip>
          )
        })}
      </div>

      <div>
        {/* <Timer isActive={true} duration={20}/> */}
      </div>
      <div className='flex flex-row justify-center'>
        {/* 
        0. determine which round, assign button texts
        1. lock in choice
        2. compare choice with card result after timer ends
        3. if wrong restart from round 1
        4. if correct move to next round
        */}
      <Button option={option1} handleGuess={handleGuess} />
      <Button option={option2} handleGuess={handleGuess} />
      {state.round===4 && <Button option={option3} handleGuess={handleGuess} />}
      {state.round===4 && <Button option={option4} handleGuess={handleGuess} />}
      </div>
    </div>
  );
}


export default App;
