import './index.css';
import { useApplicationData } from './helpers/deckApiHelpers';

function App() {

  const {
    deck,
    updateDeck,
  } = useApplicationData();

  return (
    <div className="App">
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
      <div>
        {deck && deck.deck_id}
        <button onClick={() => updateDeck('new')}>New Deck</button>
      </div>
    </div>
  );
}

export default App;
