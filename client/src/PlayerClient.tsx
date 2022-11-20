import React from 'react';
import PartyControls from './components/PartyControls'
import { usePartyApplicationData } from './helpers/usePartyApplicationData';
export default function PlayerClient() {
  const {
    state,
    updateDeck,
    handleGuess,
    handleOptions,
  } = usePartyApplicationData();


  return(
    <>
    <PartyControls state={state} player={'blue'} handleOptions={handleOptions}/>
    <PartyControls state={state} player={'red'} handleOptions={handleOptions}/>
    </>
  ) 
}