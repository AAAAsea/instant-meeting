const app = require("express")()
const server = require("http").createServer(app);
const cors = require("cors")

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})
const maxNum = 5;
app.use(cors())

const PORT = process.nextTick.PORT || 5000;

app.get("/", (req, res, next) => {
  res.send("runing")
})

const rooms = {};
io.on("connection", (socket) => {

  socket.emit('me', socket.id);

  socket.on('createRoom', ({ name }) => {
    const room = Math.floor((Math.random() + 1) * 1e8).toString(); // 随机9位数房间号
    rooms[room] = []
    socket.emit('createRoomSuccess', { room })
    // console.log('createRoom', room, name)
  });

  socket.on('joinRoom', ({ room, name }) => {

    if (!rooms[room]) {
      socket.emit('joinError', { msg: '房间不存在' })
      return;
    } else if (rooms[room].length >= maxNum) {
      socket.emit('joinError', { msg: '房间人数已满' })
      return;
    }

    // 未加入过
    const newUser = {
      name,
      id: socket.id
    }
    if (rooms[room].findIndex(e => e.id === socket.id) === -1) {
      socket.join(room)
      socket.name = name;
      rooms[room].push(newUser)
      io.to(room).emit('joined', { users: rooms[room], newUser, room })
      // console.log('joinRoom', room, name)
    } else {
      socket.emit('joined', { users: rooms[room], newUser, room })
    }
  })

  socket.on("peerConn", ({ signal, to, name, isInitiator }) => {
    io.to(to).emit("peerConn", { signal, from: socket.id, to, name, isInitiator })
    // console.log('peerConn', socket.id, to, name, isInitiator)
  })

  socket.on("setVoice", ({ id, open, room }) => {
    const user = rooms[room] ? rooms[room].find(user => user.id === id) : undefined;
    // console.log("setVoice", id)
    // console.log(rooms, room)
    if (user) {
      user.voice = open;
      io.to(room).emit('setVoice', { userId: id, open })
      // console.log("setVoice")
    }
  })

  socket.on("setVideo", ({ id, open, room }) => {
    const user = rooms[room].find(user => user.id === id);
    if (user) {
      user.video = open;
      io.to(room).emit('setVideo', { userId: id, open })
      // console.log("setVideo", id)
    }
  })

  socket.on("disconnecting", () => {
    // console.log(socket.rooms)
    for (let room of socket.rooms) {
      // 除了自己的私有房间
      if (room !== socket.id) {
        // console.log('removeUser')
        io.to(room).emit('removeUser', { userId: socket.id, name: socket.name })
      }
    }
  });

  socket.on("disconnect", () => {
    for (let room in rooms) {
      rooms[room] = rooms[room].filter(user => user.id != socket.id)
      if (rooms[room].length === 0)
        delete rooms[room]
    }
  });
})

// io.on("disconnect", (socket) => {
//   console.log(rooms)
//   for (let room in rooms) {
//     rooms[room] = rooms[room].filter(user => user.id != socket.id)
//     if (rooms[room].length === 0)
//       delete rooms[room]
//   }
// })

server.listen(PORT, () => { console.log(`Server listening on port ${PORT}`) })
