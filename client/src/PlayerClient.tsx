import PartyControls from './components/PartyControls'
import { useApplicationData } from './helpers/useApplicationData';
export default function PlayerClient() {
  const {
    state,
    updateDeck,
    handleGuess,
    handleOptions,
  } = useApplicationData();


  return(
    <>
    <PartyControls state={state} handleGuess={handleGuess} handleOptions={handleOptions}/>
    </>
  ) 
}