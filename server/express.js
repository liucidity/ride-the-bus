const express = require('express'); //Line 1
const app = express(); //Line 2
const socketIo = require('socket.io')
const http = require('http')
const port = process.env.PORT || 3001; //Line 3

const server = http.createServer(app)

const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:4000', 'http://localhost:3000'],
    // methods: ['GET', 'POST']
    allowedHeaders: ["controller"],
    credentials: true
  },
  
}) //in case server and client run on different urls
io.on('connection', (socket) => {
  console.log('client connected: ', socket.id)

  let room = ''
  
  socket.on('create-room', (roomId) => {
    console.log('roomid', roomId)
    room = roomId
  })
  
  socket.join(room)

  socket.on('newRoom', (roomId) => {
    socket.to(room).emit('joinedRoom', roomId)
  })

  socket.on('disconnect', (reason) => {
    console.log(reason, 1)
  })
  socket.on('round', (round) => {
    // console.log(round)
    socket.to(room).emit('round', round)
  })
  socket.on('setUser', (username) => {
    console.log(username)
    socket.to(room).emit('setUser', username)
  })
  socket.on('buttonPress', (player, choice) => {
    console.log(player, choice)
    socket.to(room).emit('buttonPress', player, choice)
  });

})

io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});



// This displays message that the server running and listening to specified port
server.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6
