import { useEffect, useState } from "react"

type Props= {
  isActive: boolean,
  duration: number,

}

export default function Timer({isActive, duration}:Props) {
  const [counter, setCounter] = useState(duration);

  useEffect(()=>{
    const timer = 
    counter > 0 && setInterval(() => setCounter(prev => prev - 1),1000);
    // console.log(counter)
    return () => clearInterval(timer as any)
  },[counter])


  const timeLeft = ()=> {
    
  }
  return (
    <>
    {isActive &&
      <span className="text-white text-6xl animate-[pulse_1s_infinite]">
      {counter}
      </span>
    }
    </>
  )
}