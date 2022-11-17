type Props={
  option: string,
  handleGuess: any,
}

export default function Button({option, handleGuess}:Props) {
  return (

    <button className="bg-blue-500 rounded w-40 h-12 m-4 text-white shadow-lg hover:bg-blue-600" onClick={()=> handleGuess(option)}>
      {option}
    </button>


  )
}