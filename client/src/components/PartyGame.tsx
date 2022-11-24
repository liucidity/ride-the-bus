// import './index.css';

import Timer from "./Timer";
import Message from "./Message";
import Card from "./Card";
import ReactCardFlip from "react-card-flip";
import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { usePartyApplicationData } from "../helpers/usePartyApplicationData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

//Bar Chart Elements/Config
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          size: 0
        }
      } 
    },
    title: {
      display: false,
      text: 'Players',
    },
  },
  scales: {
    x: {
      max: 10,
      ticks: {
        color: 'white',
        font: {
          size: 18
        }
      }
    },
    y: {
      ticks: {
        color: 'white',
        font: {
          size: 18
        }
      }
    }
  },
  indexAxis: 'y',
};

type Props = {
  state: any;
  updateDeck: any;
  handleRound: any;
  setTimer: any;
  handleSelection: any;
  createPlayer: any;
  disconnectPlayer: any;
  setRoomId: any;
};

export default function PartyGame(
//   {
//   state,
//   updateDeck,
//   handleRound,
//   setTimer,
//   handleSelection,
//   createPlayer,
//   disconnectPlayer,
// }: Props
) {
  const {
    state,
    updateDeck,
    handleRound,
    createPlayer,
    disconnectPlayer,
    handleSelection,
    setTimer,
    pauseGameStatus,
    startGameStatus,
    resetState,

  } = usePartyApplicationData();
  
  // const [gameStarted, setGameStarted] = useState(false);
  const [initialState, setInitialState] = useState({})
  const gameState = state.gameState

  const socketRef = useRef<Socket>();

  const startGame = async () => {
    if (gameState !== 'end') {
      // initialState = {...state}
      setInitialState({...state})
      console.log('state at start', initialState)

    } else {
      console.log(initialState)
      resetState(initialState)
      updateDeck("reshuffle")
    }
    await updateDeck("draw");
    startGameStatus();
    setTimer(10);
  };

  //Socket connection

  useEffect(() => {
    socketRef.current = io("http://localhost:3001", {
      withCredentials: true,
      extraHeaders: {
        controller: "abcd",
      },
    });
    updateDeck("new");

    socketRef.current.on("connect", () => console.log(socketRef.current.id));
    socketRef.current.on("connect_error", () => {
      setTimeout(() => socketRef.current.connect(), 5000);
    });

    socketRef.current.on("setUser", (username, socketId) => {
      console.log(username);
      createPlayer(username, socketId);
    });

    socketRef.current.on("buttonPress", (player, choice) => {
      console.log(player, choice);
      // update player state
      handleSelection(player, choice);
    });

    socketRef.current.on('disconnectPlayer', (id) => {
      console.log('disconnected player',id)
      disconnectPlayer(id)
    })

    return () => {
      socketRef.current.off("connect");
      socketRef.current.off("disconnect");
      socketRef.current.off("buttonPress");
      socketRef.current.disconnect();
    };
  }, []);

  //Round Management
  const sendRound = (round) => {
    socketRef.current.emit("round", round);
  };


  useEffect(() => {
    console.log(state.round);
    sendRound(state.round);
  }, [state.round]);


  //Bar Chart Data
  
  let labels = Object.keys(state.players)
  let datasets = labels.map((player) => {
    return state.players[player].points
  })
  let colors = ['blue', 'white', 'red', 'yellow']

  const data = {
    labels,
    datasets: [
      {
        label: 'Points',
        data: datasets,
        backgroundColor: colors,
        barThickness: 36,
        maxBarThickness:48,
        minBarLength: 24,
      },
    ]
  }


  return (
    <div className="flex flex-col items-center pt-10">
      <h1 className="text-2xl font-bold text-white pt-10">Bus Riders</h1>
      {
        <div className="text-l font-bold text-white pt-10 pb-5">
          Connect to{" "}
          <a href="http://localhost:4000" target="_blank" rel="noreferrer">
            http://localhost:4000
          </a>{" "}
          on your device
        </div>
      }
      {gameState !== 'running' && (
        <div className="text-2xl font-bold text-white pt-10 pb-5">Players:</div>
      )}

      {gameState !== 'running' &&
        Object.keys(state.players).map((player: string) => {
          return <div className="text-l font-bold text-white">{player} ✅</div>;
        })}
      {gameState !== 'running' && (
        <div className="pt-40">
          <button
            className="bg-blue-500 rounded w-40 h-12 m-4 text-white shadow-lg hover:bg-blue-600"
            onClick={() => startGame()}
          >
            Start Game
          </button>
        </div>
      )}
      <div className="flex flex-row pt-20">
        {gameState === 'running' &&
          state.card.map((card: any, index: number) => {
            return (
              <ReactCardFlip
                isFlipped={state.faces[index]}
                flipDirection="horizontal"
              >
                <Card value="card-back" image="blue-card-back.png" />
                <Card value={card.code} image={card.image} />
              </ReactCardFlip>
            );
          })}
      </div>

      <div>
        {state.timer >= 0 && gameState !== "end" && (
          <Timer
            setTimer={setTimer}
            isActive={true}
            handleRound={handleRound}
            state={state}
          />
        )}
      </div>
      <div>
        {(state.status === "correct" || state.statue === "incorrect") && (
          <p className="h-10 text-3xl text-white">
            {state.deck.remaining} cards remaining
          </p>
        )}
      </div>
      <div className="h-20">
        {state.status === "correct" && <Message status={"correct"} />}
        {state.status === "incorrect" && <Message status={"incorrect"} />}
        {state.gameState === "end" && <Message status={state}  />}
        {state.gameState !== 'end' && state.status === "none" && state.timer > 0 && (
          <Message status={state.round} />
        )}
      </div>

      {/* {gameStarted &&
        Object.keys(state.players).map((player: any) => {
          return (
            <>
            <div className="h-20">
              {player}: {state.players[player].points}
            </div>
            </>
          );
        })} */}
        {gameState === "running" && <div id='bar-chart'>
          <Bar options={options} data={data} />
        </div>}
    </div>
  );
}



