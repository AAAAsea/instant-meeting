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

const rooms = {}; // 房间成员
const roomsInfo = {}; // 房间信息
io.on("connection", (socket) => {

  socket.emit('me', socket.id);

  socket.on('createRoom', (data) => {
    let room = Math.floor(((Math.random() * 9) + 1) * 1e8).toString(); // 随机9位数房间号
    while (rooms[room]) {
      room = Math.floor(((Math.random() * 9) + 1) * 1e8).toString(); // 随机9位数房间号
    }
    const master = { room, id: socket.id, name: data.name };
    rooms[room] = [master]
    roomsInfo[room] = { ...data, room, canScreenShare: true };
    master.roomInfo = roomsInfo[room];
    socket.join(room);
    socket.emit('createRoomSuccess', master)
    socket.name = data.name;

    const publicRooms = [];
    for (let room in roomsInfo) {
      if (roomsInfo[room].isPublic)
        publicRooms.push({ ...roomsInfo[room], membersCount: rooms[room].length });
    }
    io.emit('setPublicRooms', publicRooms);
  });

  socket.on('joinRoom', ({ room, name, roomPwd }) => {
    if (!rooms[room]) {
      socket.emit('joinError', { msg: '房间不存在' })
      return;
    } else if (roomsInfo[room].roomPwd !== roomPwd) {
      socket.emit('joinError', { msg: '房间密码错误' })
      return;
    } else if (rooms[room].length >= maxNum) {
      socket.emit('joinError', { msg: '房间人数已满' })
      return;
    } else if (rooms[room].findIndex(e => e.name === name) !== -1) {
      socket.emit('joinError', { msg: '当前用户名已被占用' })
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
      io.to(room).emit('joined', { users: rooms[room], newUser, room, isLive: roomsInfo[room].isLive, canScreenShare: roomsInfo[room].canScreenShare, roomInfo: roomsInfo[room] })
    } else {
      socket.emit('joined', { users: rooms[room], newUser, room, isLive: roomsInfo[room].isLive, canScreenShare: roomsInfo[room].canScreenShare })
    }
  })

  socket.on('getPublicRooms', () => {
    const publicRooms = [];
    for (let room in roomsInfo) {
      if (roomsInfo[room].isPublic)
        publicRooms.push({ ...roomsInfo[room], membersCount: rooms[room].length });
    }
    socket.emit('setPublicRooms', publicRooms);
  })

  socket.on("peerConn", ({ signal, to, name, isInitiator }) => {
    io.to(to).emit("peerConn", { signal, from: socket.id, to, name, isInitiator })
  })

  socket.on("setVoice", ({ id, open, room }) => {
    const user = rooms[room] ? rooms[room].find(user => user.id === id) : undefined;
    if (user) {
      user.voice = open;
      io.to(room).emit('setVoice', { userId: id, open })
    }
  })

  socket.on("setVideo", ({ id, open, room, type }) => {
    const user = rooms[room] ? rooms[room].find(user => user.id === id) : undefined;
    if (user) {
      user.video = open;
      io.to(room).emit('setVideo', { userId: id, open, type })
    }
    if (!type) {
      roomsInfo[room].canScreenShare = !open;
    }
  })

  socket.on("sendMessage", ({ msg, room, name, type, time, file }) => {
    io.to(room).emit("sendMessage", { msg, name, room, type, file, time, id: socket.id })
  })

  socket.on("downloadFile", ({ fileIndex, userId }) => {
    io.to(userId).emit("downloadFile", { fileIndex, userId: socket.id })
  })

  socket.on("disconnecting", () => {
    // console.log(socket.rooms)
    for (let room of socket.rooms) {
      // 除了自己的私有房间
      if (room !== socket.id) {
        rooms[room] = rooms[room].filter(user => user.id != socket.id)
        if (rooms[room].length === 0) {
          delete rooms[room]
          delete roomsInfo[room];
          const publicRooms = [];
          for (let room in roomsInfo) {
            if (roomsInfo[room].isPublic)
              publicRooms.push({ ...roomsInfo[room], membersCount: rooms[room].length });

          }
          io.emit('setPublicRooms', publicRooms);
        }
        io.to(room).emit('removeUser', { userId: socket.id, name: socket.name })
      }
    }
  });

  socket.on("leaveRoom", () => {
    for (let room in rooms) {
      socket.leave(room);
      rooms[room] = rooms[room].filter(user => user.id != socket.id)
      if (rooms[room].length === 0) {
        delete rooms[room]
        delete roomsInfo[room];
      }
      io.to(room).emit('removeUser', { userId: socket.id, name: socket.name })
    }
    const publicRooms = [];
    for (let room in roomsInfo) {
      if (roomsInfo[room].isPublic)
        publicRooms.push({ ...roomsInfo[room], membersCount: rooms[room].length });
    }
    io.emit('setPublicRooms', publicRooms);
  })

  socket.on("disconnect", () => {
    for (let room in rooms) {
      rooms[room] = rooms[room].filter(user => user.id != socket.id)
      if (rooms[room].length === 0) {
        delete rooms[room]
        delete roomsInfo[room];
      }
    }
    const publicRooms = [];
    for (let room in roomsInfo) {
      if (roomsInfo[room].isPublic)
        publicRooms.push({ ...roomsInfo[room], membersCount: rooms[room].length });
    }
    io.emit('setPublicRooms', publicRooms);
  });
})
server.listen(PORT, () => { console.log(`Server listening on port ${PORT}`) })
