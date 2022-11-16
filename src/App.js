import './index.css';
import { useApplicationData } from './helpers/useApplicationData';

function App() {

  const {
    state,
    updateDeck,
  } = useApplicationData();

  return (
    <div className="App">
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
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
  );
}

export default App;
