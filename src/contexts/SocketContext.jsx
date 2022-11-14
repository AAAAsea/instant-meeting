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
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoType, setVideoType] = useState(1); // 1 camera,  0 screen
  const [roomCreating, setRoomCreating] = useState(false);
  const [roomJoinning, setRoomJoinning] = useState(false);
  const [roomJoinned, setRoomJoinned] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);

  const me = useRef('');
  const eventBucket = useRef([]); // 收集每个peer的监听事件
  const stream = useRef(null); // useEffect里面只能拿到初始值，故出此下策
  const userStreamRef = useRef([]); // 同上

  useEffect(() => {
    socket.once('me', (id) => me.current = id);

    socket.on('createRoomSuccess', ({ room }) => {
      setRoom(room)
      setRoomCreating(false);
      setRoomCreated(true);
    })

    socket.on('joined', ({ users, newId, stream, room }) => {
      console.log('joined', users)
      setRoom(room);
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
      // userStreamRef.current.splice(userStreamRef.current.findIndex(e => e.userId === userId), 1)
      // setUserStreams([...userStreamRef.current])
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

    peer.on('track', (track) => {
      console.log('onTrack', track)
      // userStreamRef.current.push({ userName, stream, userId })
      // setUserStreams([...userStreamRef.current])
    })

    peer.on('connect', () => {
      console.log(userId + ' connected')
      peers[userId] = peer;
      setRoomJoinning(false);
      setRoomJoinned(true);
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

  const initMyVoice = (open) => {
    // console.log(open)
    setVoiceOpen(open);
    // 关闭音频
    const oldVoiceTrack = stream.current.getAudioTracks()[0];
    if (!open) {
      if (!stream.current) return;
      oldVoiceTrack && oldVoiceTrack.stop()
      return;
    }

    // 打开音频
    const originStream = stream.current;
    navigator.mediaDevices.getUserMedia({
      audio: true,
    }).then((currentStream) => {
      if (!stream.current) {
        stream.current = currentStream;
        setMyVideo(currentStream)
      }
      const newvoiceTrack = currentStream.getTracks()[0];

      oldVoiceTrack && stream.current.removeTrack(oldVoiceTrack);
      stream.current.addTrack(newvoiceTrack);

      // 之前没有stream的话需要通知添加stream，否则更新track
      if (!originStream) {
        setMyVideo(stream.current);
        for (let peer in peers) {
          console.log(peers[peer])
          peers[peer].addStream(stream.current)
        }
      } else {
        for (let peer in peers) {
          // 之前没有音频轨道的话需要添加，否则替换
          oldVoiceTrack
            ? peers[peer].replaceTrack(oldVoiceTrack, newvoiceTrack, myVideo)
            : peers[peer].addTrack(newvoiceTrack, myVideo)
          console.log(peer)
        }
      }


    })
  }

  const initMyVideo = ({ type, quality, open }) => {
    setVideoOpen(open)

    // 关闭视频
    if (!open) {
      if (!stream.current) return;
      const oldVideoTrack = stream.current.getVideoTracks()[0];
      oldVideoTrack && oldVideoTrack.stop();
      return;
    }

    // 打开视频
    setVideoType(type)
    const originStream = stream.current;

    const handlePromise = (currentStream) => {
      console.log(currentStream)
      if (!stream.current) {
        stream.current = currentStream;
        setMyVideo(currentStream)
      }

      const oldVideoTrack = stream.current.getVideoTracks()[0];
      const newVideoTrack = currentStream.getVideoTracks()[0];
      oldVideoTrack && stream.current.removeTrack(oldVideoTrack);
      stream.current.addTrack(newVideoTrack);

      // 之前没有stream的话需要通知添加stream
      if (!originStream) {
        setMyVideo(stream.current);
        for (let peer in peers) {
          console.log(peers[peer])
          peers[peer].addStream(stream.current)
        }
      } else {
        for (let peer in peers) {
          peers[peer].replaceTrack(oldVideoTrack, newVideoTrack, myVideo)
          console.log(peer)
        }
      }
    }
    // camera or screen
    if (type) {
      navigator.mediaDevices.getUserMedia({
        video: true,
      }).then(handlePromise)
    } else {
      navigator.mediaDevices.getDisplayMedia({
        video: true,
      }).then(handlePromise)
    }
  }

  const createRoom = () => {
    setRoomCreating(true);
    socket.emit('createRoom', { name })
  }

  const joinRoom = (room) => {
    setRoomJoinning(true);
    socket.emit('joinRoom', { room, name, stream })
  }

  return (
    <SocketContext.Provider value={{ me, call, callAccepted, callEnded, myVideo, setMyVideo, name, setName, initMyVideo, createRoom, joinRoom, userStreams, peers, voiceOpen, initMyVoice, videoOpen, videoType, room, roomCreating, roomJoinning, roomCreated, roomJoinned }}>
      {children}
    </SocketContext.Provider>
  )

}

export { SocketContextProvider, SocketContext }