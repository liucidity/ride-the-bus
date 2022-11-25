const express = require("express"); //Line 1
const app = express(); //Line 2
const socketIo = require("socket.io");
const http = require("http");
const port = process.env.PORT || 3001; //Line 3

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:4000", "http://localhost:3000", 'https://ride-the-bus-player.onrender.com/', 'https://ride-the-bus.onrender.com/'],
    // methods: ['GET', 'POST']
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true,
  },
}); //in case server and client run on different urls



io.on("connection", (socket) => {
  console.log("client connected: ", socket.id);

  const room = 'mainRoom'
  socket.join(room)

  socket.on("enterRoom", ({ username }, callback) => {
    console.log('testing ID', username, socket.id)
    socket.to(room).emit("setUser", username, socket.id);
  });

  socket.on("round", (round) => {
    socket.to(room).emit("round", round);
  });


  socket.on("buttonPress", (player, choice) => {
    console.log(player, choice);
    socket.to(room).emit("buttonPress", player, choice);
  });

  socket.on("disconnect", (reason) => {
    console.log('disc id', socket.id)
    socket.to(room).emit('disconnectPlayer', socket.id)
    console.log(reason, 1);
  });
});

// io.of("/").adapter.on("create-room", (room) => {
//   console.log(`room ${room} was created`);
// });

// io.of("/").adapter.on("join-room", (room, id) => {
//   console.log(`socket ${id} has joined room ${room}`);
// });

// This displays message that the server running and listening to specified port
server.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6
