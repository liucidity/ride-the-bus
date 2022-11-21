const express = require('express'); //Line 1
const app = express(); //Line 2
const socketIo = require('socket.io')
const http = require('http')
const port = process.env.PORT || 3001; //Line 3

const server = http.createServer(app)

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
}) //in case server and client run on different urls
io.on('connection', (socket) => {
  console.log('client connected: ', socket.id)

  socket.join('game-room')

  socket.on('disconnect', (reason) => {
    console.log(reason)
  })
  socket.on('round', (round) => {
    console.log(round)
    socket.to('game-room').emit('round', round)
  })
  socket.on('buttonPress', (player, choice) => {
    console.log(player, choice)
    socket.to('game-room').emit('buttonPress', player, choice)
  });
})



// This displays message that the server running and listening to specified port
server.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6
