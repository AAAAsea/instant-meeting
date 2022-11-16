import { createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from 'simple-peer';
import { useContext } from "react";
import { MessageContext } from '@/contexts/MessageContext'
import React from 'react'
const SocketContext = createContext();

const socket = io('http://localhost:5000/');
const peers = {};

// eslint-disable-next-line react/prop-types
const SocketContextProvider = ({ children }) => {
  const [call, setCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [name, setName] = useState('')
  const [userVideo, setUserVideo] = useState([]);
  const [myVideo, setMyVideo] = useState(null);
  const [room, setRoom] = useState(""); // make the room controlled cause of the input
  const [userStreams, setUserStreams] = useState([]);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoType, setVideoType] = useState(1); // 1 camera,  0 screen
  const [roomCreating, setRoomCreating] = useState(false);
  const [roomJoinning, setRoomJoinning] = useState(false);
  const [roomJoinned, setRoomJoinned] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomErrorMsg, setRoomErrorMsg] = useState('');
  const [users, setUsers] = useState([]);

  const { message } = useContext(MessageContext)

  const me = useRef('');
  const eventBucket = useRef([]); // 收集每个peer的监听事件
  const stream = useRef(null); // useEffect里面只能拿到初始值，故出此下策
  const userStreamRef = useRef([]); // 同上
  const usersRef = useRef([]); // 同上

  useEffect(() => {
    socket.once('me', (id) => me.current = id);

    socket.on('createRoomSuccess', ({ room }) => {
      setRoom(room)
      setRoomCreating(false);
      setRoomCreated(true);
      message.success('创建成功')
    })

    socket.on('joined', ({ users, newId, stream, room }) => {
      console.log('joined', users)
      setRoom(room);
      usersRef.current = users;
      setUsers(usersRef.current);
      if (users.length === 1) {
        setRoomJoinning(false)
        setRoomJoinned(true);
        return;
      }

      // 与未连接的用户建立连接
      users.forEach(user => {
        // console.log(user.id, peers[user.id])
        if (user.id !== socket.id && !peers[user.id]) {
          getPeerConnection(user.id, user.name, newId !== socket.id);
        }
      })
    })

    // 每次收到peerConn，取出对应的signal事件执行
    socket.on('peerConn', ({ from, signal }) => {
      eventBucket.current[from] && eventBucket.current[from](signal);
    })

    socket.on('removeUser', ({ userId }) => {
      peers[userId].destroy()
      userStreamRef.current.splice(userStreamRef.current.findIndex(e => e.userId === userId), 1)
      setUserStreams([...userStreamRef.current])
    })

    socket.on('joinError', ({ msg }) => {
      message.error(msg);
      setRoomErrorMsg(msg);
      setRoomJoinning(false);
    })

  }, [])

  const getPeerConnection = (userId, userName, isInitiator) => {
    const peer = new Peer({
      initiator: isInitiator,
      trickle: false,
      stream: stream.current
    })

    peer.on('signal', (signal) => {
      socket.emit('peerConn', { signal, to: userId, from: me.current, name, isInitiator })
    })

    peer.on('stream', (stream) => {
      console.log('onStream', stream)
      userStreamRef.current.push({ userName, stream, userId })
      setUserStreams([...userStreamRef.current])
    })

    peer.on('track', (track) => {
      console.log('onTrack', track)
    })

    peer.on('connect', () => {
      console.log(userId + ' connected')
      peers[userId] = peer;
      setRoomJoinning(false);
      setRoomJoinned(true);
    })

    peer.once('close', () => {
      delete peers[userId];
    })

    // 收集signal事件，待socket响应时触发
    eventBucket.current[userId] = (signal) => peer.signal(signal)
  }

  const initMyVoice = (open) => {
    // console.log(open)
    setVoiceOpen(open);
    // 关闭音频
    if (!open) {
      if (!stream.current) return;
      const oldVoiceTrack = stream.current.getAudioTracks()[0];
      oldVoiceTrack && oldVoiceTrack.stop()
      return;
    }

    // 打开音频
    const originStream = stream.current;
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then((currentStream) => {
      if (!stream.current) {
        stream.current = currentStream;
        setMyVideo(currentStream)
      }
      const oldVoiceTrack = stream.current.getAudioTracks()[0];
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

  const initMyVideo = ({ type, open }) => {
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
        video: true
      }).then(handlePromise)
    } else {
      navigator.mediaDevices.getDisplayMedia({
        video: true
      }).then(handlePromise)
    }
  }

  const createRoom = () => {
    setRoomCreating(true);
    socket.emit('createRoom', { name })
  }

  const joinRoom = (room) => {
    if (!/^\d{9}$/.test(room)) {
      message.error('请输入正确的房间号')
      return
    }
    setRoomJoinning(true);
    socket.emit('joinRoom', { room, name, stream })
  }

  return (
    <SocketContext.Provider value={{ me, call, callAccepted, callEnded, myVideo, setMyVideo, name, setName, initMyVideo, createRoom, joinRoom, userStreams, peers, voiceOpen, initMyVoice, videoOpen, videoType, room, setRoom, roomCreating, roomJoinning, roomCreated, roomJoinned, setRoomCreated, roomErrorMsg, users }}>
      {children}
    </SocketContext.Provider>
  )

}

export { SocketContextProvider, SocketContext }