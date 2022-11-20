import { useEffect, useState, useRef } from "react"
import classNames from 'classnames'
import React from "react";

type Props= {
  isActive: boolean,
  handleRound: any,
  state: any,
  setTimer: any,
}

export default function Timer({isActive, handleRound, state, setTimer}:Props) {
  // const [counter, setCounter] = useState(duration);
  const duration = state.timer
  let timerTextColor = duration > 3 ? "text-white" : "text-red-900"

  useEffect(()=>{
    const duration = state.timer
    
    const timer = duration > -1 && setInterval(() => setTimer(duration - 1),1000);
    console.log('duration', duration)
    if (duration === 0) {
      console.log('duration is 0!')
      handleRound(state.players)
    }

    return () => clearInterval(timer as any)
  },[duration])



  return (
    <div className="h-20">
    {isActive &&
      <p className={classNames(`${timerTextColor} text-7xl animate-ping`, {
        "hidden": !isActive
         || duration <= 0,
      })}>
      {duration}
      </p>
    }
    </div>
  )
}