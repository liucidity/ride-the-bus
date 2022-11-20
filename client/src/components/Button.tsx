type Props={
  option: string,
  handleGuess: any,
  status: string,
}

export default function Button({option, handleGuess, status}:Props) {

  const statusToBoolean = (status: string) => {
    if (status === 'correct' || status === 'incorrect') {
      return true
    } else {
      return false
    }
  }

  let buttonStatus = statusToBoolean(status);

  return (

    <button className="bg-blue-500 rounded w-40 h-12 m-4 text-white shadow-lg hover:bg-blue-600" onClick={()=> handleGuess(option)} disabled={buttonStatus}>
      {option}
    </button>


  )
}