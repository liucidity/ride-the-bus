import React, { useEffect, useRef, useState } from 'react';
import { io } from "socket.io-client"
import PartyControls from "./components/PartyControls"
import PlayerCreate from "./components/PlayerCreate"

type HandCard = { value: number; suit: string; code: string; golden?: boolean };

type ResEvent =
  | { type: 'assign'; from: string; to: string; amount: number }
  | { type: 'redirect'; from: string; to: string; amount: number }
  | { type: 'protect'; player: string; target: string }
  | { type: 'blocked'; from: string; to: string; amount: number };

const socket = io(process.env.REACT_APP_SOCKET_URL || 'https://ride-the-bus-socket.onrender.com', {
  transports: ['websocket', 'polling', 'flashsocket']
})

export default function PlayerClient() {
  const [round, setRound] = useState(1)
  const [lap, setLap] = useState(1)
  const [maxLaps, setMaxLaps] = useState(3)
  const [username, setUsername] = useState('')
  const usernameRef = useRef('')
  const [playerReady, setPlayerReady] = useState(false)
  const [gameState, setGameState] = useState('paused')
  const [hand, setHand] = useState<HandCard[]>([])
  const [mySips, setMySips] = useState(0)
  const [myHandLength, setMyHandLength] = useState(0)
  const [leaderboard, setLeaderboard] = useState<Record<string, { sips: number; handLength: number }>>({})

  // Pyramid declaration state
  const [declarationPhase, setDeclarationPhase] = useState(false)
  const [declarationPyramidCard, setDeclarationPyramidCard] = useState<HandCard | null>(null)
  const [declarationSips, setDeclarationSips] = useState(0)
  const [declarationAllPlayers, setDeclarationAllPlayers] = useState<string[]>([])
  const [declared, setDeclared] = useState(false)
  const [resolutionPhase, setResolutionPhase] = useState(false)
  const [resolutionEvents, setResolutionEvents] = useState<ResEvent[]>([])

  useEffect(() => {
    socket.on('connect_error', () => {
      setTimeout(() => socket.connect(), 5000)
    })

    socket.on('gameState', (gs: string) => {
      setGameState(gs)
      if (gs === 'pyramid') {
        // Auto-enter declaration mode so the UI appears even if pyramidDeclarePhase
        // is received before or after this event.
        setDeclarationPhase(true)
        setDeclared(false)
        // setLeaderboard(leaderboard)
      }
      if (gs !== 'pyramid') {
        setDeclarationPhase(false)
        setDeclarationPyramidCard(null)
        setDeclared(false)
        setResolutionPhase(false)
        setResolutionEvents([])
      }
      if (gs === 'end') {
        setHand([])
      }
      if (gs === 'paused') {
        setMySips(0)
        setMyHandLength(0)
        setLeaderboard({})
      }
    })

    socket.on('round', (round: number) => {
      setRound(round)
    })

    socket.on('lap', (l: number, ml: number) => {
      setLap(l)
      setMaxLaps(ml)
    })

    socket.on('handUpdate', (targetPlayer: string, updatedHand: HandCard[]) => {
      if (targetPlayer === usernameRef.current) {
        setHand(updatedHand)
      }
    })

    socket.on('playerStats', (stats: Record<string, { sips: number; handLength: number }>) => {
      console.log('🎯 PlayerClient received playerStats:', stats)
      setLeaderboard(stats)
      const name = usernameRef.current
      if (name && stats[name]) {
        setMySips(stats[name].sips)
        setMyHandLength(stats[name].handLength)
      }
    })

    socket.on('pyramidDeclarePhase', (
      _cardIndex: number,
      card: HandCard,
      sips: number,
      playerNames: string[]
    ) => {
      setDeclarationPyramidCard(card)
      setDeclarationSips(sips)
      setDeclarationAllPlayers(playerNames)
      setDeclared(false)
      setResolutionPhase(false)
      setDeclarationPhase(true)
    })

    socket.on('pyramidResolution', (events: ResEvent[]) => {
      setResolutionEvents(events || [])
      setDeclarationPhase(false)
      setResolutionPhase(true)
    })

    return () => {
      socket.off('gameState')
      socket.off('round')
      socket.off('lap')
      socket.off('handUpdate')
      socket.off('playerStats')
      socket.off('pyramidDeclarePhase')
      socket.off('pyramidResolution')
      socket.disconnect()
    }
  }, [])

  const sendPress = (player: string, choice: string) => {
    socket.emit("buttonPress", player, choice)
  }

  const onDeclare = (cardCode: string, cardGolden: boolean, target: string) => {
    socket.emit('pyramidDeclare', username, cardCode, cardGolden, target)
    setDeclared(true)
  }

  const onPass = () => {
    socket.emit('pyramidPass')
    setDeclared(true)
  }

  const setUser = (username: string) => {
    setUsername(username)
    usernameRef.current = username
    setPlayerReady(true)
    socket.emit('enterRoom', { username })
  }

  return (
    <>
      {!playerReady && <PlayerCreate setUser={setUser} setUsername={setUsername} username={username} />}
      {playerReady && (
        <PartyControls
          player={username}
          sendPress={sendPress}
          round={round}
          lap={lap}
          maxLaps={maxLaps}
          gameState={gameState}
          hand={hand}
          mySips={mySips}
          myHandLength={myHandLength}
          leaderboard={leaderboard}
          declarationPhase={declarationPhase}
          declarationPyramidCard={declarationPyramidCard}
          declarationSips={declarationSips}
          declarationAllPlayers={declarationAllPlayers}
          declared={declared}
          resolutionPhase={resolutionPhase}
          resolutionEvents={resolutionEvents}
          onDeclare={onDeclare}
          onPass={onPass}
        />
      )}
    </>
  )
}
