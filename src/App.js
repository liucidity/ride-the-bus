import './index.css';
import updateDeck from './helpers/deckApiHelpers';
import { useEffect, useState } from 'react';

function App() {

  const [ deck, setDeck ] = useState()

  useEffect(() => {
    let newDeck = updateDeck('new');
    setDeck(newDeck)
  }, [])

  console.log('deck:', deck)

  return (
    <div className="App">
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
      <div>
        {/* {deck.deck_id} */}
      </div>
    </div>
  );
}

export default App;
