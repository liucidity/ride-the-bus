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
} from "chart.js";
import { Bar } from "react-chartjs-2";

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
      position: "top" as const,
      labels: {
        font: {
          size: 0,
        },
      },
    },
    title: {
      display: false,
      text: "Players",
    },
  },
  scales: {
    x: {
      max: 10,
      ticks: {
        color: "white",
        font: {
          size: 18,
        },
      },
    },
    y: {
      ticks: {
        color: "white",
        font: {
          size: 18,
        },
      },
    },
  },
  indexAxis: "y",
  maintainAspectRatio: false,
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

export default function PartyGame() {

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
  const [initialState, setInitialState] = useState({});
  const gameState = state.gameState;

  const socketRef = useRef<Socket>();

  const startGame = async () => {
    if (gameState !== "end") {
      // initialState = {...state}
      setInitialState({ ...state });
      console.log("state at start", initialState);
    } else {
      console.log(initialState);
      resetState(initialState);
      updateDeck("reshuffle");
    }
    await updateDeck("draw");
    startGameStatus();
    setTimer(10);
  };

  //Socket connection

  useEffect(() => {
    socketRef.current = io("https://ride-the-bus-socket.onrender.com", {
      transports: ['websocket', 'polling', 'flashsocket'] 
      // withCredentials: true,
      // extraHeaders: {
      //   'Access-Control-Allow-Origin': "abcd",
      // },
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

    socketRef.current.on("disconnectPlayer", (id) => {
      console.log("disconnected player", id);
      disconnectPlayer(id);
    });

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

  let labels = Object.keys(state.players);
  let datasets = labels.map((player) => {
    return state.players[player].points;
  });
  let colors = ["blue", "white", "red", "yellow"];

  const data = {
    labels,
    datasets: [
      {
        label: "Points",
        data: datasets,
        backgroundColor: colors,
        barThickness: 18,
        maxBarThickness: 18,
        minBarLength: 6,
      },
    ],
  };

  return (
    <div className="flex flex-col items-center pt-0">
      <h1 className="text-2xl font-bold text-white pt-10">Bus Riders</h1>
      {
        <div className="text-l font-bold text-white pt-10 pb-5">
          Connect to{" "}
          <a href="http://ride-the-bus-player.onrender.com" target="_blank" rel="noreferrer">
            http://ride-the-bus-player.onrender.com
          </a>{" "}
          on your device
        </div>
      }
      {gameState !== "running" && (
        <div className="text-2xl font-bold text-white pt-10 pb-5">Players:</div>
      )}

      {gameState !== "running" &&
        Object.keys(state.players).map((player: string) => {
          return <div className="text-l font-bold text-white">{player} ✅</div>;
        })}
      {gameState !== "running" && (
        <div className="pt-40">
          <button
            className="bg-blue-500 rounded w-40 h-12 m-4 text-white shadow-lg hover:bg-blue-600"
            onClick={() => startGame()}
          >
            Start Game
          </button>
        </div>
      )}
      <div className="flex flex-row pt-10 pb-10">
        {gameState === "running" &&
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
        {state.status === "reveal" && (
          <p className="h-10 text-3xl text-white">
            {state.deck.remaining} cards remaining
          </p>
        )}
      </div>
      <div className="h-20">
        {state.status === "reveal" && <Message state={state} />}
        {state.gameState === "end" && <Message state={state} />}
        {state.gameState !== "end" &&
          state.status === "none" &&
          state.timer > 0 && <Message state={state} />}
      </div>
      {gameState === "running" && (
        <div id="bar-chart">
          <Bar options={options} data={data} />
        </div>
      )}
    </div>
  );
}
