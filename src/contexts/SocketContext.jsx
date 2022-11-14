import { createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from 'simple-peer';

const SocketContext = createContext();

const socket = io('http://localhost:5000/');
const peers = {};

const SocketContextProvider = ({ children }) => {
  const [call, setCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [name, setName] = useState('Me')
  const [userVideo, setUserVideo] = useState([]);
  const [myVideo, setMyVideo] = useState(null);
  const [room, setRoom] = useState();
  const [userStreams, setUserStreams] = useState([]);


  const me = useRef('');
  const eventBucket = useRef([]); // 收集每个peer的监听事件
  const stream = useRef(null); // useEffect里面只能拿到初始值，故出此下策
  const userStreamRef = useRef([]); // 同上

  useEffect(() => {
    socket.once('me', (id) => me.current = id);

    socket.once('createRoomSuccess', ({ room }) => {
      setRoom(room)
      console.log(room)
    })

    socket.on('joined', ({ users, newId, stream }) => {
      console.log('joined', users)
      console.log('peers', peers)

      // 与未连接的用户建立连接
      users.forEach(user => {
        // console.log(user.id, peers[user.id])
        if (user.id !== socket.id && !peers[user.id]) {
          getPeerConnection(user.id, user.name, newId !== socket.id);
        }
      })
      // for (let i = users.length - 1; i >= 0; i--) {
      //   if (users[i].id !== socket.id && !peers[users[i].id]) {
      //     getPeerConnection(users[i].id, users[i].name, newId === socket.id);
      //   }
      // }
    })

    // 每次收到peerConn，取出对应的signal事件执行
    socket.on('peerConn', ({ from, signal }) => {
      eventBucket.current[from] && eventBucket.current[from](signal);
    })

    socket.on('removeStream', ({ userId }) => {
      userStreamRef.current.splice(userStreamRef.current.findIndex(e => e.userId === userId), 1)
      setUserStreams([...userStreamRef.current])
    })

    socket.once('disconnect', () => {
      // setPeers({ ...peers, [me]: null })
    })
  }, [])

  const getPeerConnection = (userId, userName, isInitiator) => {
    const peer = new Peer({
      initiator: isInitiator,
      trickle: false,
      stream: stream.current
    })
    // if (stream) peer.addStream(stream);

    peer.on('signal', (signal) => {
      // console.log(signal)
      socket.emit('peerConn', { signal, to: userId, from: me.current, name, isInitiator })
    })

    peer.on('stream', (stream) => {
      console.log('onStream', stream)
      userStreamRef.current.push({ userName, stream, userId })
      setUserStreams([...userStreamRef.current])
    })

    peer.on('connect', () => {
      console.log(userId + ' connected')
      peers[userId] = peer;
    })

    peer.once('close', () => {
      peers[userId] = null;
    })

    // peer.once('error', () => {
    //   peers[userId] = null;
    // })

    /**
     * 
     * @description: 触发signal 错误示例 
     */
    // socket.once('peerConn', ({ signal, from, to }) => {
    //   console.log('收到2： from ' + from, signal)
    //   peer.signal(signal);
    //   // }
    // })

    /**
     * 
     * @description: 触发signal 正确示例 
     */
    eventBucket.current[userId] = (signal) => peer.signal(signal)
  }

  const initMyVideo = ({ type, quality }) => {
    const qualities = {
      'h': {
        width: {
          max: 1920
        },
        height: {
          max: 1080
        }
      },
      'm': {
        width: {
          max: 1280
        },
        height: {
          max: 720
        }
      },
      'l': {
        width: {
          max: 854
        },
        height: {
          max: 480
        }
      }
    }
    type ?
      navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      }).then((currentStream) => {
        stream.current = currentStream;
        setMyVideo(currentStream);
        // console.log(peers)
        for (let peer in peers) {
          console.log(peers[peer])
          peers[peer].addStream(currentStream)
        }
      }) : navigator.mediaDevices.getDisplayMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      }).then((currentStream) => {
        setStream(currentStream)
        setMyVideo(currentStream);
        for (let peer in peers) {
          peers[peer].addStream(currentStream)
        }
      })
  }

  const shutOffMyVideo = () => {
    myVideo.getTracks().forEach(e => e.stop());
    for (let k in peers) {
      peers[k].removeStream(myVideo)
    }
    socket.emit('removeStream', { userId: me, room })
    setMyVideo(null);
  }

  const createRoom = () => {
    socket.emit('createRoom', { name })
  }

  const joinRoom = (room) => {
    console.log('joinRoom')
    setRoom(room);
    socket.emit('joinRoom', { room, name, stream })
  }

  return (
    <SocketContext.Provider value={{ me, call, callAccepted, callEnded, myVideo, setMyVideo, name, setName, initMyVideo, createRoom, joinRoom, userStreams, peers, shutOffMyVideo }}>
      {children}
    </SocketContext.Provider>
  )

}

export { SocketContextProvider, SocketContext }