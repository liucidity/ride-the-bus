type Props={
  option: string,
}

export default function Button({option}:Props) {
  return (

    <button className="bg-blue-500 rounded w-40 h-12 m-4 text-white shadow-lg hover:bg-blue-600">
      {option}
    </button>


  )
}