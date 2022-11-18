import { useEffect, useState, useRef } from "react"
import classNames from 'classnames'

type Props= {
  isActive: boolean,
  duration: number,

}

export default function Timer({isActive, duration}:Props) {
  const [counter, setCounter] = useState(duration);
  let timerTextColor = counter > 5 ? "text-white" : "text-red-900"
  useEffect(()=>{
    
    const timer = 
    counter > 0 && setInterval(() => setCounter(prev => prev - 1),1000);
    
    return () => clearInterval(timer as any)
  },[counter])


  // const timeLeft = (counter)=> {
  //   // if counter > 5 {}
  // }
  return (
    <div className="h-20">
    {isActive &&
      <p className={classNames(`${timerTextColor} text-7xl animate-ping`, {
        "hidden": !isActive
         || counter === 0,
      })}>
      {counter}
      </p>
    }
    </div>
  )
}