type Props={
  option: any,
  // status: string,
  sendPress: any,
  player:string
}

export default function PartyButton({option, player, sendPress}:Props) {

  const statusToBoolean = (status: string) => {
    if (status === 'correct' || status === 'incorrect') {
      return true
    } else {
      return false
    }
  }

  // let buttonStatus = statusToBoolean(status);
  // console.log(player)
  return (

    // <button className="bg-blue-500 rounded w-40 h-12 m-4 text-white shadow-lg hover:bg-blue-600" onClick={()=> handleSelection(player,option)} disabled={buttonStatus}>
    //   {option}
    // </button>
    

    // <button className="bg-blue-500 rounded w-40 h-12 m-4 text-white shadow-lg hover:bg-blue-600" onClick={()=> sendPress(player, option)} disabled={buttonStatus}>
    //   {option}
    // </button>
    <button className="bg-blue-500 rounded w-40 h-12 m-4 text-white shadow-lg hover:bg-blue-600" onClick={()=> sendPress(player, option)} >
      {option}
    </button>


  )
}