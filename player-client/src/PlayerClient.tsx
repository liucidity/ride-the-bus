import React from 'react';
import PartyControls from './components/PartyControls'
export default function PlayerClient() {



  return(
    <>
    <PartyControls player={'blue'}/>
    {/* <PartyControls state={state} player={'blue'} handleOptions={handleOptions}/> */}
    {/* <PartyControls state={state} player={'red'} handleOptions={handleOptions}/> */}
    </>
  ) 
}