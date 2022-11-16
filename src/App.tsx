import './index.css';
import Button from './components/Button';
import Timer from './components/Timer';
import { useApplicationData } from './helpers/useApplicationData';


function App() {

  const {
        state,
        updateDeck,
      } = useApplicationData();
  return (
    <div className="flex flex-col items-center py-10">
      <div className="App">
       <div>
         {state.deck && state.deck.deck_id}
         <button onClick={() => updateDeck('new')}>New Deck</button>
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
        <img alt='card-back' src="card-back.png" className="h-64"/>
        <img alt='card-back' src="card-back.png" className="h-64"/>
        <img alt='card-back' src="card-back.png" className="h-64"/>
        <img alt='card-back' src="card-back.png" className="h-64"/>
      </div>

      <div>
        <Timer isActive={true} duration={20}/>
      </div>
      <div className='flex flex-row justify-center'>
      <Button option={'Higher'}/>
      <Button option={'Lower'}/>
      </div>
    </div>
  );
}

// import './index.css';
// import { useApplicationData } from './helpers/useApplicationData';

// function App() {

//   const {
//     state,
//     updateDeck,
//   } = useApplicationData();

//   return (
//     <div className="App">
//       <h1 className="text-3xl font-bold underline">
//         Hello world!
//       </h1>
//       <div>
//         {state.deck && state.deck.deck_id}
//         <button onClick={() => updateDeck('new')}>New Deck</button>
//       </div>
//       <div>
//         {state.card && state.card.code}
//         {state.card && <img alt='card' src={state.card.image}></img>}
//         <button onClick={() => updateDeck('draw')}>Draw Card</button>
//       </div>
//     </div>
//   );
// }

// export default App;

export default App;
